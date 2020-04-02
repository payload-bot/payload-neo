import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";
import api_key from "./api-key";
import NotificationsCommand from "./notifications";

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
                "api-key": new api_key(),
                "notifications": new NotificationsCommand()
            }
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args: any = await this.getArgs(msg);
        const lang = await this.getLanguage(msg);

        if (!args) {
            await this.respond(msg, lang.config_error_invalidsyntax.replace('%prefix', await this.getPrefix(msg)));

            return false;
        }

        if (!this.subCommands[args[0]]) {
            await this.respond(msg, lang.config_error_invalidsubcommand.replace('%prefix', await this.getPrefix(msg)));

            return false;
        }

        return await this.runSub(args[0], client, msg);
    }
}