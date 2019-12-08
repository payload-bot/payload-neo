import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message } from "discord.js";

export default class Notifications extends Command {
    constructor() {
        super(
            "notifications",
            "Sets your TFBot notifications level. 2 = all, 1 = major, 0 = none.",
            [
                {
                    name: "level",
                    description: "Your desired notifications level. 2 = all, 1 = major, 0 = none.",
                    required: true,
                    type: "number",
                    options: [2, 1, 0]
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

        await client.userManager.setNotifLevel(msg.author, args[0]);
        
        await this.respond(msg, `Set notifications to \`${args[0]}\``);

        return true;
    }
}