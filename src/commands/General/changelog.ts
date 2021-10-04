import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { codeBlock } from "@discordjs/builders";
import { getChangelog } from "#root/util/get-changelog";

@ApplyOptions<CommandOptions>({
  description:
    "Retreives the changelog for the current version or [version]. Versions must follow the #.#.# format.",
})
export class UserCommand extends Command {
  async run(msg: Message, args: Args) {
    const version = await args.pick("string").catch(() => null);

    if (!version) return await send(msg, { content: "Invalid version format" });

    const changeLog = await getChangelog(version);

    if (!changeLog) return await send(msg, { content: "Invalid version" });

    return await send(msg, {
      content: codeBlock("md", changeLog),
    });
  }
}
