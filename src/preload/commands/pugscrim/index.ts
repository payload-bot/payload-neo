import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";

export default class PugScrim extends Command {

    constructor() {
        super(
            "pugscrim",
            "Starts a pugscrim. First 5 people to type !pug will be drafted into the pugscrim. Sends info automatically when recieved.",
            undefined,
            ["MANAGE_GUILD"],
            ["MANAGE_GUILD"],
            ["text"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        return true;
    }
}