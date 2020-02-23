
import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";
import got from "got";
import { render } from "../../../util/render-log";

export default class Combine extends Command {
    constructor() {
        super(
            "combine",
            "Combines 2 or more logs into a bigger log.",
            [
                {
                    name: "map",
                    description: "The map name for the combined logs.",
                    required: true,
                    type: "string"
                },
                {
                    name: "title",
                    description: "The log title for the combined logs.",
                    required: true,
                    type: "string"
                },
                {
                    name: "log url 1",
                    description: "The first log to combine.",
                    required: true,
                    type: "string"
                },
                {
                    name: "log url 2",
                    description: "The second log to combine.",
                    required: true,
                    type: "string"
                },
                {
                    name: "log url 3",
                    description: "More logs to combine.",
                    required: false,
                    type: "string"
                }
            ],
            ["SEND_MESSAGES", "ATTACH_FILES"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.getArgs(msg);

        const map = args[0];
        const title = args[1];
        const logs = args.slice(2);

        if (!map || map.match(/logs\.tf\/\d+/)) {
            return await this.fail(msg, `Invalid syntax. Make sure to specify the map and title before the log URLs. Type \`${await this.getPrefix(msg)}help combine\` to learn more.`);
        } else if (!title || title.match(/logs\.tf\/\d+/)) {
            return await this.fail(msg, `Invalid syntax. Make sure to specify the map and title before the log URLs. Type \`${await this.getPrefix(msg)}help combine\` to learn more.`);
        } else if (logs.length < 2) {
            return await this.fail(msg, `Invalid syntax. Make sure to specify the map and title before the log URLs. Type \`${await this.getPrefix(msg)}help combine\` to learn more.`);
        }

        let logIds: Array<string> = [];
        for (let i = 0; i < logs.length; i++) {
            const logId = logs[i].match(/\d+/);

            if (!logId) {
                return await this.fail(msg, `\`${logs[i]}\` is not a valid log.`);
            }

            logIds.push(logId![0]);
        }

        msg.channel.startTyping();

        const user = await client.userManager.getUser(msg.author.id);

        let apiKey;
        if (!user.user.logsTfApiKey) {
            return await this.fail(msg, `You have not set a logs.tf API key. Type \`${await this.getPrefix(msg)}help config\` to find out more.`);
        } else {
            apiKey = user.user.logsTfApiKey;
        }

        /**
         * Initiate Logify API request.
         */

        const requestBody = {
            token: apiKey,
            title: title,
            map: map,
            ids: logIds
        };

        const res = await got("https://sharky.cool/api/logify/combine/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            json: true,
            body: requestBody,
            throwHttpErrors: false
        });

        if (!res.body.success) {
            client.emit("error", res.body);
            return await this.fail(msg, "Error combining logs.");
        }

        await this.respond(msg, "**Done!** https://logs.tf/" + res.body.log_id);

        const screenshotBuffer = await render("https://logs.tf/" + res.body.log_id);
        await msg.channel.send({
            files: [screenshotBuffer]
        });

        return true;
    }
}
