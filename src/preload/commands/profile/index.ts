import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, MessageEmbed } from "discord.js";
import got from "got";
import Language from "../../../lib/types/Language";

export default class Profile extends Command {
    apiAddress: string;

    constructor() {
        super(
            "profile",
            "Gets user's profile.",
            [
                {
                    name: "user mention",
                    description: "User's profile to get.",
                    required: false,
                    type: "string"
                }
            ]
        );

        this.apiAddress = "payload.tf";
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const lang: Language = await this.getLanguage(msg);
        let profile = msg.mentions.users.first() || msg.author;
        const user = await client.userManager.getUser(profile.id);
        const steamid = user.user.steamID;

        msg.channel.startTyping();

        const res = await got(`${this.apiAddress}/api/rgl/${user.user.steamID}`, {
            json: true
        });

        const embed = new MessageEmbed({
            title: profile.tag,
            description:
                `Bot: ${(profile.bot) ? "Yes" : "No"}
                 ID: ${profile.id}
                 Steam ID: ${steamid || "NOT SET"}
                ${res.body.success ? `RGL Profile: [here](http://rgl.gg/Public/PlayerProfile.aspx?p=${res.body.steamid})` : "\u200b"}
                ${lang.profile_points}: ${user.getFeetPushed()}
                `,
            color: 3447003,
            thumbnail: {
                url: profile.displayAvatarURL()
            }
        });

        await msg.channel.send(embed);
        msg.channel.stopTyping(true)

        return true;
    }
}