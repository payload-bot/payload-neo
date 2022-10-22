import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import PayloadColors from "#utils/colors";
import { inlineCode } from "@discordjs/builders";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";
import { isNullishOrEmpty } from "@sapphire/utilities";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Commands.Description,
  detailedDescription: LanguageKeys.Commands.Commands.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const { stores } = this.container;

    let restrictions: string[] = [];
    if (msg.guild != null) {
      const fetchedRestructions = await this.container.database.guild.findUnique({
        where: { id: msg.guildId! },
        select: { commandRestrictions: true },
      });

      restrictions = fetchedRestructions?.commandRestrictions ?? [];
    }

    const commands = [...stores.get("commands").values()];
    const autoCommands = [...stores.get("autoresponses" as any).values()];

    if (!isNullishOrEmpty(restrictions)) {
      commands.filter(cmd => restrictions.includes(cmd.name));
      autoCommands.filter(cmd => restrictions.includes(cmd.name));
    }

    const embed = new MessageEmbed({
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
