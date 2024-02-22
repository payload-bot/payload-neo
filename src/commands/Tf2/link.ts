import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { getSteamIdFromArgs } from "#utils/getSteamId";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";
import { eq } from "drizzle-orm";
import { user } from "#root/drizzle/schema.js";

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
      await this.database
        .update(user)
        .set({
          steamId: null,
        })
        .where(eq(user.id, msg.author.id));

      await send(msg, args.t(LanguageKeys.Commands.Link.Delete));
      return;
    }

    if (!steamId) {
      await send(msg, args.t(LanguageKeys.Commands.Link.MissingId));
      return;
    }

    const testResult = await getSteamIdFromArgs(steamId);

    if (testResult === null) {
      await send(msg, args.t(LanguageKeys.Commands.Link.MalformedId));
      return;
    }

    await this.database
      .update(user)
      .set({
        steamId: null,
      })
      .where(eq(user.id, msg.author.id));

    await send(msg, args.t(LanguageKeys.Commands.Link.Success));
  }
}
