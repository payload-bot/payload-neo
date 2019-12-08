import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message} from "discord.js";

export default class Invite extends Command {
    constructor() {
        super(
            "invite",
            "Sends a discord invite link"
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        await this.respond(msg, "https://discordapp.com/oauth2/authorize?client_id=644333502870978564&permissions=201452545&scope=bot");
        return true;
    }
}