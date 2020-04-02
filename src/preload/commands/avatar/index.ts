import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";

export default class Avatar extends Command {

    constructor() {
        super(
            "avatar",
            "Returns avatar of user.",
        [
            {
                name: "user mention",
                description: "The user who's avatar you want to view.",
                required: false,
                type: "string"
            }
        ],
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        let targetUser = msg.mentions.users.first() || msg.author;
        await this.respond(msg, targetUser.displayAvatarURL());
        return true;
    }
    
}