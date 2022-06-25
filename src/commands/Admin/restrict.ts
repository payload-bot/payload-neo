import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { send } from "@sapphire/plugin-editable-commands";
import { Server } from "#lib/models";
import { LanguageKeys } from "#lib/i18n/all";
import { codeBlock } from "@discordjs/builders";
import { isNullishOrEmpty } from "@sapphire/utilities";

const FLAGS = ["all", "list"];

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Restrict.Description,
  detailedDescription: LanguageKeys.Commands.Restrict.DetailedDescription,
  requiredUserPermissions: ["MANAGE_MESSAGES"],
  runIn: ["GUILD_TEXT"],
  flags: FLAGS,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const useAllCommands = args.getFlags("all");
    const listAllRestrictions = args.getFlags("list");

    if (listAllRestrictions) {
      const server = await Server.findOne(
        { id: msg.guildId! },
        {},
        { upsert: true }
      ).lean();

      const commands = server?.commandRestrictions;

      if (isNullishOrEmpty(commands)) {
        return await msg.channel.send(
          args.t(LanguageKeys.Commands.Restrict.ListRestrictionsEmpty)
        );
      }

      return await msg.channel.send(
        args.t(LanguageKeys.Commands.Restrict.ListRestrictions, {
          commands: codeBlock(commands.join(", ")),
        })
      );
    }

    if (args.finished && !useAllCommands) {
      return await send(msg, args.t(LanguageKeys.Commands.Restrict.NoCommands));
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
      .map((cmd) => cmd?.name ?? cmd)
      .filter((name) => !["restrict", "unrestrict"].includes(name));

    if (isNullishOrEmpty(filteredCommands)) {
      return await send(msg, args.t(LanguageKeys.Commands.Restrict.NoCommands));
    }

    await this.setRestrictions(msg.guildId!, filteredCommands);

    return await msg.channel.send(
      args.t(LanguageKeys.Commands.Restrict.RestrictSuccess, {
        commands: codeBlock(filteredCommands.join(", ")),
      })
    );
  }

  private async setRestrictions(guildId: string, commands: string[]) {
    const server = await Server.findOne(
      { id: guildId },
      {},
      { upsert: true }
    ).lean();

    const existingRestrictions = server!.commandRestrictions ?? [];

    const toRestrict = [...new Set([...existingRestrictions, ...commands])];

    await Server.findOneAndUpdate(
      { id: guildId },
      { commandRestrictions: toRestrict }
    );
  }
}
