import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, RichEmbed } from "discord.js";
import got from "got";
import { ensureSteamID } from "../../../util/steam-id";
import { isUndefined } from "util";

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
        this.apiAddress = "";
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args: any = await this.parseArgs(msg);
        const targetUser = msg.mentions.users.first() || msg.author;

        msg.channel.startTyping();

        let steamIDTestResultFromArgs: string;
        if (args !== false && args.length > 0) {
            steamIDTestResultFromArgs = await ensureSteamID(args[0] as string);
            if (isUndefined(steamIDTestResultFromArgs)) steamIDTestResultFromArgs = args[0];
        }

        const user = await client.userManager.getUser(targetUser.id);
        const steamid = user.user.steamID;
        const steamIdToTest = steamIDTestResultFromArgs || steamid as string

        if (!steamIdToTest) {
            return await this.fail(msg, "No steamid detected. Either link one if using mentions, or provide one as your arguments.");
        }

        const res = await got(`${this.apiAddress}/api/rgl/${steamIdToTest}`, {
            json: true
        });
        const body = res.body

        if (body.success !== true) {
            const embed = new RichEmbed({
                title: "RGL Profile lookup",
                description:
                    `Steam ID: ${body.steamid}
                     Error: ${body.error}
                `,
                color: 3447003,
            });
            await msg.channel.send(embed)
            return true;
        }

        const embed = new RichEmbed({
            title: "RGL Profile lookup",
            description:
                `Steam ID: ${body.steamid}
                 RGL Name: ${body.name}
                 ${body.banned ? ":no_entry: Banned" : "\u200b"}
                 ${body.probation ? ":exclamation: Probation" : "\u200b"}
                 ${body.verified ? ":white_check_mark: Verified" : "\u200b"}
                 Total Earnings: ${body.totalEarnings}
                `,
            color: 3447003,
            thumbnail: {
                url: body.avatar
            },
            footer: {
                text: `RGL Profile: http://rgl.gg/Public/PlayerProfile.aspx?p=${body.steamid}`
            }
        });

        await msg.channel.send(embed)

        msg.channel.stopTyping(true);

        return true;
    }

}