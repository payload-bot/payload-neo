import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";
import Set from "./set";
import Delete from "./delete";
import Show from "./show";

export default class Prefix extends Command {
    constructor() {
        super(
            "prefix",
            "Sets the guild-specific prefix.",
            [
                {
                    name: "command",
                    description: "Command of prefix to execute",
                    required: true,
                    type: "string",
                    options: ["set", "delete", "show"]
                },
                {
                    name: "new prefix",
                    description: "Your new prefix",
                    required: false,
                    type: "string",
                }
            ],
            undefined,
            ["ADMINISTRATOR"],
            ["text"],
            undefined,
            {
                set: new Set(),
                show: new Show(),
                delete: new Delete()
            }
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        let args: any = await this.parseArgs(msg);

        if (args[0]) {
            if (!this.subCommands[args[0]]) {
                return await this.fail(msg, `Invalid subcommand. Type \`${await this.getPrefix(msg)}help prefix\` to learn more.`);
            }

            return await this.runSub(args[0], client, msg);
        }
        return true;
    }
}