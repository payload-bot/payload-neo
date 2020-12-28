import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";
import axios from "axios";
import { render } from "../../../util/render-log";
import Language from "../../../lib/types/Language";

export default class Log extends Command {

    constructor() {
        super(
            "log",
            "Displays the latest log of the (mentioned) user. Must have your steamid linked through the bot.",
            [
                {
                    name: "user mention",
                    description: "user to mention",
                    required: false,
                    type: "string"
                }
            ],
            ["SEND_MESSAGES", "ATTACH_FILES"],
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const targetUser = msg.mentions.users.first() || msg.author;
        const lang: Language = await this.getLanguage(msg);

        msg.channel.startTyping();

        const dbUser = await client.userManager.getUser(targetUser.id);

        if (!dbUser.user.steamID) {
            return await this.fail(msg, lang.log_fail_noid.replace('%prefix', await this.getPrefix(msg)));
        }

        const { data } = await axios(`http://logs.tf/api/v1/log?limit=1&player=${dbUser.user.steamID}`);

        if (data.logs.length < 1) {
            return await this.fail(msg, lang.log_fail_nologhistory);
        }

        const logID = data.logs[data.logs.length - 1].id;

        const screenshotBuffer = await render(`http://logs.tf/${logID}#${dbUser.user.steamID}`);

        await msg.channel.send(`<http://logs.tf/${logID}#${dbUser.user.steamID}>`, {
            files: [screenshotBuffer]
        });

        msg.channel.stopTyping(true);
        return true;
    }
}