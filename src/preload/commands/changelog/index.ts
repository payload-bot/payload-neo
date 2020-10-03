import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";
import { version as ImportVersion } from "../../../util/version_control"
import { getChangelog } from "../../../util/get-changelog";
import Language from "../../../lib/types/Language";

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
        const lang: Language = await this.getLanguage(msg);

        const version = args[0] as string || ImportVersion;

        const changelog = getChangelog(version);

        if (!changelog) await this.fail(msg, lang.changelog_invalid);
        else {
            await this.respond(msg, lang.changelog_reply.replace('%changelog', changelog));
            return true;
        }
    }
}