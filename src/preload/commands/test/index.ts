import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";

export default class Test extends Command {

    constructor() {
        super(
            "test",
            "Tests a wide-range of utensiles.",
            undefined,
            undefined,
            undefined,
            undefined,
            true
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        throw new Error("This is a test.");
        return true;
    }
    
}