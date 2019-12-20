import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";

export default class PugScrim extends Command {

    constructor() {
        super(
            "pugscrim",
            "Starts a pugscrim. First 5 people to type !pug will be drafted into the pugscrim. Sends info automatically when recieved.",
            undefined,
            ["READ_MESSAGE_HISTORY", "SEND_MESSAGES", "READ_MESSAGES"],
            ["MANAGE_MESSAGES", "MANAGE_ROLES_OR_PERMISSIONS"],
            ["text"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        return true;
    }
}