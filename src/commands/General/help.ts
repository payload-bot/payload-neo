import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import PayloadColors from "#utils/colors";
import { inlineCode } from "@discordjs/builders";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<CommandOptions>({
  description: "Displays all commands",
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const { stores } = this.container;

    const commands = [...stores.get("commands").values()];
    const autoCommands = [...stores.get("autoresponses" as any).values()];

    const embed = new MessageEmbed({
      title: args.t(LanguageKeys.Commands.Commands.EmbedTitle),
      color: PayloadColors.USER,
      fields: [
        {
          name: args.t(LanguageKeys.Commands.Commands.Commands),
          value: commands.map((c) => inlineCode(c.name)).join(", "),
        },
        {
          name: args.t(LanguageKeys.Commands.Commands.AutoCommands),
          value: autoCommands.map((ac) => inlineCode(ac.name)).join(", "),
        },
      ],
    });

    return await send(msg, { embeds: [embed] });
  }
}
