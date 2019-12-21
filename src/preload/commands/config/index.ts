import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";
import NotificationsCommand from "./notifications";
import LogsApiKeyCommand from "./logs-api-key";
import config from "../../../config";

export default class Config extends Command {
    constructor() {
        super(
            "config",
            "**USING THESE COMMANDS IN A PUBLIC SERVER PUTS YOUR ACCOUNT AT RISK OF BEING HIJACKED! MAKE SURE TO USE THESE COMMANDS ONLY IN BOT DMS!**",
            [
                {
                    name: "subcommand",
                    description: "The subcommand to execute.",
                    required: true,
                    type: "string"
                },
                {
                    name: "subcommand args",
                    description: "The subcommand arguments.",
                    required: true,
                    type: "string"
                }
            ],
            undefined,
            undefined,
            ["dm"],
            undefined,
            {
                "logs-api-key": new LogsApiKeyCommand(),
                "notifications": new NotificationsCommand()
            }
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.getArgs(msg);
    

        if (!args) {
            await this.respond(msg, `Invalid syntax. Type \`${config.PREFIX}help config\` to learn more.`);

            return false;
        }

        if (!this.subCommands[args[0]]) {
            await this.respond(msg, `Invalid syntax. Type \`${config.PREFIX}help config\` to learn more.`);

            return false;
        }

        return await this.runSub(args[0], client, msg);
    }
}