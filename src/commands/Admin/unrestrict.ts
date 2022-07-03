import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { send } from "@sapphire/plugin-editable-commands";
import { LanguageKeys } from "#lib/i18n/all";
import { codeBlock } from "@discordjs/builders";

const FLAGS = ["all"];

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Unrestrict.Description,
  detailedDescription: LanguageKeys.Commands.Unrestrict.DetailedDescription,
  requiredUserPermissions: ["MANAGE_MESSAGES"],
  runIn: ["GUILD_TEXT"],
  flags: FLAGS,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const useAllCommands = args.getFlags("all");

    if (args.finished && !useAllCommands) {
      return await send(msg, args.t(LanguageKeys.Commands.Unrestrict.NoCommands));
    }

    let commands: PayloadCommand[];
    if (useAllCommands) {
      commands = [
        ...this.container.stores.get("commands").keys(),
        ...this.container.stores.get("autoresponses" as any).keys(),
      ] as unknown as PayloadCommand[];
    } else {
      commands = await args.repeat("commandName");
    }

    // don't restrict the un/restrict command
    const filteredCommands = commands
      .map(cmd => cmd?.name ?? cmd)
      .filter(name => !["restrict", "unrestrict"].includes(name));

    if (!filteredCommands.length) {
      return await send(msg, args.t(LanguageKeys.Commands.Unrestrict.NoCommands));
    }

    await this.unsetRestrictions(msg.guildId!, filteredCommands);

    return msg.channel.send(
      args.t(LanguageKeys.Commands.Unrestrict.UnrestrictSuccess, {
        commands: codeBlock(filteredCommands.join(", ")),
      })
    );
  }

  private async unsetRestrictions(guildId: string, commands: string[]) {
    const server = await this.database.guild.findUnique({
      where: { id: guildId },
      select: { commandRestrictions: true },
    });

    const existingRestrictions = server!.commandRestrictions;

    const toUnrestrict: string[] = [];

    for (const command of commands) {
      if (existingRestrictions.includes(command)) toUnrestrict.push(command);
    }

    const finalRestrictions = existingRestrictions.filter(curr => !toUnrestrict.includes(curr));

    await this.database.guild.upsert({
      where: { id: guildId! },
      update: { commandRestrictions: finalRestrictions },
      create: { id: guildId!, commandRestrictions: finalRestrictions },
    });
  }
}
