import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { User } from "#lib/models/User";
import { getSteamIdFromArgs } from "#utils/getSteamId";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

const FLAGS = ["D", "d"];

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Link.Description,
  detailedDescription: LanguageKeys.Commands.Link.DetailedDescription,
  flags: FLAGS,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const steamId = await args.pick("string").catch(() => null);

    if (args.getFlags("D") || args.getFlags("d")) {
      await User.findOneAndUpdate(
        { id: msg.author.id },
        { $unset: { steamId: 1 } }
      );

      return await send(msg, args.t(LanguageKeys.Commands.Link.Delete));
    }

    if (!steamId) {
      return await send(msg, args.t(LanguageKeys.Commands.Link.MissingId));
    }

    const testResult = await getSteamIdFromArgs(steamId);

    if (testResult === null) {
      return await send(msg, args.t(LanguageKeys.Commands.Link.MalformedId));
    }

    await User.findOneAndUpdate({ id: msg.author.id }, { steamId: testResult });

    return await send(msg, args.t(LanguageKeys.Commands.Link.Success));
  }
}
