import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, EmbedBuilder } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import PayloadColors from "#utils/colors.ts";
import { inlineCode } from "@discordjs/builders";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Commands.Description,
  detailedDescription: LanguageKeys.Commands.Commands.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const { stores } = this.container;

    const commands = [...stores.get("commands").values()];
    const autoCommands = [...stores.get("auto").values()];

    const embed = new EmbedBuilder({
      title: args.t(LanguageKeys.Commands.Commands.EmbedTitle),
      color: PayloadColors.User,
      fields: [
        {
          name: args.t(LanguageKeys.Commands.Commands.Commands),
          value: commands.map(c => inlineCode(c.name)).join(", "),
        },
        {
          name: args.t(LanguageKeys.Commands.Commands.AutoCommands),
          value: autoCommands.map(ac => inlineCode(ac.name)).join(", "),
        },
      ],
    });

    await send(msg, { embeds: [embed] });
  }
}
