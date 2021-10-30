import type { CommandContext, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import PayloadColors from "#utils/colors";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";
import {
  BuildCommandHelp,
  LanguageHelpDisplayOptions,
} from "#lib/i18n/CommandHelper";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Help.Description,
  detailedDescription: LanguageKeys.Commands.Help.DetailedDescription,
  aliases: ["h"],
})
export class UserCommand extends PayloadCommand {
  async messageRun(
    msg: Message,
    args: PayloadCommand.Args,
    { commandPrefix }: CommandContext
  ) {
    if (args.finished) {
      // return commands
    }

    const command = await args.pickResult("commandName");

    if (!command.success) {
      // not a valid command
    }

    const commandData = command.value;
    const translatedCases = args.t(LanguageKeys.System.HelpTitles);

    const builder = new BuildCommandHelp()
      .setAliases(translatedCases.aliases)
      .setUsages(translatedCases.usages)
      .setDetails(translatedCases.extendedHelp);

    const detailedDescription = args.t(
      commandData!.detailedDescription
    ) as LanguageHelpDisplayOptions;

    const content = builder.display(
      commandData!.name,
      commandData?.aliases?.join(", ") ?? null,
      detailedDescription,
      commandPrefix
    );

    const embed = new MessageEmbed({
      title: commandData!.name,
      color: PayloadColors.COMMAND,
      description: content,
    });

    return await send(msg, { embeds: [embed] });
  }
}
