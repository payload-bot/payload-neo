import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";
import { ensureSteamID } from "../../../util/steam-id";

export default class Link extends Command {
    constructor() {
        super(
            "link",
            "Links your steam account to your Discord account.",
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

        if (args === false) {
            return false;
        }

        const steamIDTestResult = await ensureSteamID(args[0] as string);

        if (!steamIDTestResult) {
            return await this.fail(msg, "Invalid `<Steam ID>` argument.");
        }

        const user = await client.userManager.getUser(msg.author.id);

        user.user.steamID = steamIDTestResult;

        await user.save();

        await this.respond(msg, `Successfully overrode old Steam ID with \`${steamIDTestResult}\` for \`${msg.author.tag}\`.`);

        return true;
    }
}