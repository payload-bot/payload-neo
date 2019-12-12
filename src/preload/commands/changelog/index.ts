import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";
import config from "../../../config";
import { getChangelog } from "../../../util/get-changelog";

export default class Changelog extends Command {
    constructor() {
        super(
            "changelog",
            "Retreives the changelog for the current version or [version]. Versions must follow the #.#.# format.",
            [
                {
                    name: "version",
                    description: "The version to view the changelog for.",
                    required: false,
                    type: "string"
                }
            ]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.getArgs(msg);

        const version = args[0] as string || config.info.version;

        const changelog = getChangelog(version);

        if (!changelog) {
            await this.respond(msg, "Invalid version format.");

            return false;
        }

        await this.respond(msg, "```md\n" + changelog + "\n```");
        msg.channel.stopTyping(true);
        return true;   
    }
}