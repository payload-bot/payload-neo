import type { MessageCommandContext, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, EmbedBuilder } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import PayloadColors from "#utils/colors";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";
import { BuildCommandHelp, type LanguageHelpDisplayOptions } from "#lib/i18n/CommandHelper";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Help.Description,
  detailedDescription: LanguageKeys.Commands.Help.DetailedDescription,
  aliases: ["h"],
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args, context: MessageCommandContext) {
    if (args.finished) {
      // Just send the commands command
      const allCommands = this.container.stores.get("commands");
      const runCommand = allCommands.get("commands");

      await runCommand.messageRun(msg, args, context);
      return;
    }

    const command = await args.pick("commandName");

    const translatedCases = args.t(LanguageKeys.System.HelpTitles);

    const builder = new BuildCommandHelp()
      .setDescription(translatedCases.description)
      .setAliases(translatedCases.aliases)
      .setUsages(translatedCases.usages)
      .setDetails(translatedCases.moreDetails);

    const detailedDescription = args.t(command.detailedDescription as any) as LanguageHelpDisplayOptions;

    const content = builder.display(
      command.name,
      this.getAliases(command),
      detailedDescription,
      context.commandPrefix,
      args.t(command.description),
    );

    const embed = new EmbedBuilder({
      title: command.name,
      color: PayloadColors.Command,
      description: content,
    });

    await send(msg, { embeds: [embed] });
  }

  private getAliases(command: PayloadCommand) {
    if (!!command.aliases) return null;

    return command.aliases.join(", ");
  }
}
