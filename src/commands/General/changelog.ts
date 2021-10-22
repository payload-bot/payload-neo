import type { Args, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { codeBlock } from "@discordjs/builders";
import { getChangelog } from "#utils/get-changelog";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";

@ApplyOptions<CommandOptions>({
  description:
    "Retreives the changelog for the current version or [version]. Versions must follow the #.#.# format.",
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: Args) {
    const version = await args.pick("string").catch(() => null);

    if (!version) return await send(msg, { content: "Invalid version format" });

    const changeLog = await getChangelog(version);

    if (!changeLog) return await send(msg, { content: "Invalid version" });

    return await send(msg, {
      content: codeBlock("md", changeLog),
    });
  }
}
