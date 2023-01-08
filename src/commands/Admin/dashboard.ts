import { ApplyOptions } from "@sapphire/decorators";
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";

@ApplyOptions<PayloadCommand.Options>({
  description: LanguageKeys.Commands.Dashboard.Description,
  detailedDescription: LanguageKeys.Commands.Dashboard.DetailedDescription,
  runIn: [CommandOptionsRunTypeEnum.GuildText],
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const component = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder({
        url: `https://payload.tf/dashboard/${msg.guild!.id}`,
        style: ButtonStyle.Link,
        label: args.t(LanguageKeys.Commands.Dashboard.Button),
      }),
    ]);

    await send(msg, {
      content: args.t(LanguageKeys.Commands.Dashboard.Title),
      components: [component],
    });
  }
}
