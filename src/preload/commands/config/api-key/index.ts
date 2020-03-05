import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message } from "discord.js";

export default class api_key extends Command {
    constructor() {
        super(
            "api-key",
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
        const args = await this.parseArgs(msg, 1);

        if (args === false) {
            return await this.fail(msg, "Visit http://logs.tf/uploader to get your API key.");
        }

        const user = await client.userManager.getUser(msg.author.id);
        user.user.logsTfApiKey = args[0] as string;
        await user.save();

        await this.respond(msg, `Set logs.tf api key to \`${args[0]}\``);

        return true;
    }
}