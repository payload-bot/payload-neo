import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageActionRow, MessageButton } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Settings.Description,
  detailedDescription: LanguageKeys.Commands.Settings.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const component = new MessageActionRow().addComponents([
      new MessageButton({
        url: "https://payload.tf/settings",
        style: "LINK",
        label: args.t(LanguageKeys.Commands.Settings.Button),
      }),
    ]);

    return await send(msg, {
      content: args.t(LanguageKeys.Commands.Settings.Message),
      components: [component],
    });
  }
}
