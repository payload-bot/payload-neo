import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { codeBlock } from "@discordjs/builders";
import { getChangelog } from "#utils/get-changelog";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Changelog.Description,
  detailedDescription: LanguageKeys.Commands.Changelog.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const version = await args.pick("string").catch(() => null);

    if (!version) {
      return await send(
        msg,
        args.t(LanguageKeys.Commands.Changelog.InvalidVersion)
      );
    }

    const changeLog = await getChangelog(version);

    if (!changeLog) {
      return await send(
        msg,
        args.t(LanguageKeys.Commands.Changelog.InvalidFormat)
      );
    }

    return await send(msg, {
      content: codeBlock("md", changeLog),
    });
  }
}
