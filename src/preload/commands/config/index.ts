import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";
import NotificationsCommand from "./notifications";
import PrefixCommand from "./prefix";

export default class Config extends Command {
    constructor() {
        super(
            "config",
            "config stuff.",
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
            undefined,
            undefined,
            {
                "notifications": new NotificationsCommand(),
                "prefix": new PrefixCommand()
            }
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.getArgs(msg);

        if (!args) {
            await this.respond(msg, `Invalid syntax. Type \`${await this.getPrefix(msg.guild.id)}config\` to learn more.`);

            return false;
        }

        if (!this.subCommands[args[0]]) {
            await this.respond(msg, `Invalid syntax. Type \`${await this.getPrefix(msg.guild.id)}config\` to learn more.`);

            return false;
        }

        return await this.runSub(args[0], client, msg);
    }
}