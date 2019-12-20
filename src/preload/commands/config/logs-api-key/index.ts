import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message } from "discord.js";
import { query } from "../../../../util/database";

export default class logsApiKey extends Command {
    constructor() {
        super(
            "logs-api-key",
            "**USING THESE COMMANDS IN A PUBLIC SERVER PUTS YOUR ACCOUNT AT RISK OF BEING HIJACKED! MAKE SURE TO USE THESE COMMANDS ONLY IN BOT DMS!**\n\nSets your logs.tf API key to <key>",
            [
                {
                    name: "key",
                    description: "Your logs.tf API key.",
                    required: true,
                    type: "string"
                }
            ],
            undefined,
            undefined,
            ["dm"],
            undefined,
            undefined,
            ["config"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args: any = await this.parseArgs(msg, 1);

        if (args === false) {
            return false;
        }

        await client.userManager.setLogsKey(msg.author.id, args[0]);

        await this.respond(msg, `Set logs-api-key to \`${args[0]}\``);

        return true;
    }
}