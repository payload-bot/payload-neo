import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";
import { random } from "../../../util/random";

export default class Choose extends Command {
    constructor() {
        super(
            "choose",
            "Randomly chooses <amount> options from a list.",
            [
                {
                    name: "amount",
                    description: "The amount of options to choose from the list.",
                    required: true,
                    type: "number",
                    min: 1
                },
                {
                    name: "option 1",
                    description: "An option in the list.",
                    required: true,
                    type: "string"
                },
                {
                    name: "option 2",
                    description: "Another option in the list.",
                    required: true,
                    type: "string"
                },
                {
                    name: "option 3",
                    description: "More options in the list.",
                    required: false,
                    type: "string"
                }
            ]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.parseArgs(msg);

        if (args === false) {
            return false;
        }

        const amount = args[0];
        let list = args.slice(1);

        let chosen = [];
        for (let i = 0; i < Number(amount); i++) {
            if (list.length == 0) break;

            let chosenIndex = random(0, list.length - 1);
            chosen.push(list.splice(chosenIndex, 1));
        }

        await this.respond(msg, chosen.join(", "));

        return true;
    }
}