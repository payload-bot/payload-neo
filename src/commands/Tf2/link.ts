import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { User } from "#lib/models/User";
import { getSteamIdFromArgs } from "#utils/getSteamId";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Link.Description,
  detailedDescription: LanguageKeys.Commands.Link.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const steamId = await args.pick("string").catch(() => null);

    if (!steamId) {
      return await send(msg, args.t(LanguageKeys.Commands.Link.MissingId));
    }

    const testResult = await getSteamIdFromArgs(steamId);

    if (!testResult) {
      return await send(msg, args.t(LanguageKeys.Commands.Link.MalformedId));
    }

    await User.findOneAndUpdate({ id: msg.author.id }, { steamId });

    return await send(msg, args.t(LanguageKeys.Commands.Link.Success));
  }
}
