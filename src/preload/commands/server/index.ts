import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";
import ExecCommand from "./exec";
import ListCommand from "./list";
import RemoveCommand from "./remove";
import SetCommand from "./set";
import Language from "../../../lib/types/Language";

export default class Server extends Command {
    constructor() {
        super(
            "server",
            "**USING THESE COMMANDS IN A PUBLIC SERVER PUTS YOUR TF2 SERVERS AT RISK OF BEING HIJACKED! MAKE SURE TO USE THESE COMMANDS ONLY IN BOT DMS!**",
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
                    required: false,
                    type: "string"
                }
            ],
            undefined,
            undefined,
            ["dm"],
            undefined,
            {
                list: new ListCommand(),
                set: new SetCommand(),
                remove: new RemoveCommand(),
                exec: new ExecCommand()
            }
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.getArgs(msg);
        const lang: Language = await this.getLanguage(msg);

        if (!args) {
            await this.respond(msg, lang.server_invalidsyntax.replace("%prefix", await this.getPrefix(msg)));

            return false;
        }

        if (!this.subCommands[args[0]]) {
            await this.respond(msg, lang.server_invalidcmd.replace("%prefix", await this.getPrefix(msg)));

            return false;
        }
        
        return await this.runSub(args[0], client, msg);
    }
}