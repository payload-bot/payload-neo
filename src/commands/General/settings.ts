import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Settings.Description,
  detailedDescription: LanguageKeys.Commands.Settings.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const component = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder({
        url: "https://payload.tf/settings",
        style: ButtonStyle.Link,
        label: args.t(LanguageKeys.Commands.Settings.Button),
      }),
    ]);

    await send(msg, {
      content: args.t(LanguageKeys.Commands.Settings.Message),
      components: [component],
    });
  }
}
