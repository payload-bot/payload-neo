import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";
import got from "got";
import { render } from "../../../util/render-log";

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
        msg.channel.startTyping();
        
        let dbUser = await client.userManager.findUser(msg);
    
        if (!dbUser) return await this.fail(msg, "User does not have their Steam ID linked. Steam IDs can be linked to your account using `!link <steam id>`.");

        const res = await got(`http://logs.tf/api/v1/log?limit=1&player=` + dbUser, {
            json: true
        });
        const data = res.body;

        if (data.logs.length < 1) {
            return await this.fail(msg, "User does not have a log history.");
        }

        const logID = data.logs[data.logs.length - 1].id;
    
        const screenshotBuffer = await render("http://logs.tf/" + logID + "#" + dbUser);
        
        await msg.channel.send("<http://logs.tf/" + logID + "#" + dbUser + ">", {
            files: [screenshotBuffer]
        });

        return true;
    }
}