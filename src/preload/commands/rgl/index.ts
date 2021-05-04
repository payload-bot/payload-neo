import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, MessageEmbed } from "discord.js";
import axios from "axios";
import { ensureSteamID } from "../../../util/steam-id";
import Language from "../../../lib/types/Language";
import PayloadColors from "../../../lib/misc/colors";

export default class RGL extends Command {
    apiAddress: string;

    constructor() {
        super(
            "rgl",
            "Returns data of [mentioned] user.",
            [
                {
                    name: "Steam ID",
                    description: "The user's Steam ID who's RGL profile you want to view.",
                    required: false,
                    type: "string"
                }
            ],
        );
        this.apiAddress = "https://payload.tf";
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args: any = await this.parseArgs(msg);
        const lang: Language = await this.getLanguage(msg);
        const targetUser = msg.mentions.users.first() || msg.author;

        msg.channel.startTyping();

        let userSteamId: string = "";
        if (args && args.length > 0) {
            const testSteamId = await ensureSteamID(args[0] as string);
            if (testSteamId) userSteamId = args[0];
        } else {
            const user = await client.userManager.getUser(targetUser.id);
            userSteamId = user.user.steamID;
        }

        if (!userSteamId.length) return await this.fail(msg, lang.rgl_fail_noid);

        const { data } = await axios(`${this.apiAddress}/api/external/rgl/${userSteamId}`);

        if (data.success === false) {
            const embed = new MessageEmbed({
                title: lang.rgl_embedtitle,
                description:
                    `${lang.rgl_embeddesc_steamid}: ${data.steamid}
                     ${lang.rgl_embeddesc_error}: ${data.error}
                `,
                color: PayloadColors.USER,
            });
            await msg.channel.send(embed)
            return true;
        }

        let description =  `
            ${lang.rgl_embeddesc_steamid}: ${data.steamid}
            ${lang.rgl_embeddesc_name}: ${data.name}
            ${lang.rgl_embeddesc_earnings}: ${data.totalEarnings}
        `;

        if (data.bans.banned) description += lang.rgl_embeddesc_banned;
        if (data.bans.probation) description += lang.rgl_embeddesc_probation;
        if (data.bans.verified) description += lang.rgl_embeddesc_verified;

        const embed = new MessageEmbed({
            title: lang.rgl_embedtitle,
            description,
            color: PayloadColors.USER,
            thumbnail: {
                url: data.avatar
            }
        });

        embed.setURL(data.link)

        await msg.channel.send(embed);

        msg.channel.stopTyping(true);

        return true;
    }

}