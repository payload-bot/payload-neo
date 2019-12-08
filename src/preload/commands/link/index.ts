import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";
import { ensureSteamID } from "../../../util/steam-id";

export default class link extends Command {

    constructor() {
        super(
            "link",
            "Links steam id to your discord id.",
            [
                {
                    name: "Steam ID",
                    description: "Your Steam ID. Can be in any of the popular Steam ID formats.",
                    required: true,
                    type: "string"
                }
            ]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.parseArgs(msg);
        if (args === false) return false;

        const steamIDTestResult = await ensureSteamID(args[0] as string);

        if (!steamIDTestResult) return await this.fail(msg, "Invalid `<Steam ID>` argument.");
        else client.userManager.setSteamID(msg, steamIDTestResult);

        await this.respond(msg, `Updated steam id with ${steamIDTestResult} for ${msg.author.tag}`);
        return true;
    }

}