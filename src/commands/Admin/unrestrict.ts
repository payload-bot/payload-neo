import type { Args, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { send } from "@sapphire/plugin-editable-commands";
import { Server } from "#lib/models/Server";

const FLAGS = ["all"];

@ApplyOptions<CommandOptions>({
  description: "Restricts a command from being used in a channel.",
  requiredUserPermissions: ["MANAGE_MESSAGES"],
  runIn: ["GUILD_TEXT"],
  flags: FLAGS,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: Args) {
    const useAllCommands = args.getFlags("all");
    if (args.finished && !useAllCommands) {
      return await send(msg, "no commands chosen");
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

    if (!filteredCommands.length) {
      return await send(msg, "no commands to restrict");
    }

    await this.unsetRestrictions(msg.guildId!, filteredCommands);

    return msg.channel.send(filteredCommands.join(", "));
  }

  private async unsetRestrictions(guildId: string, commands: string[]) {
    const server = await Server.findOne({ id: guildId }, {}, { upsert: true })
      .lean()
      .exec();

    const existingRestrictions = server!.commandRestrictions ?? [];

    const toUnrestrict: string[] = [];

    for (const command of commands) {
      if (existingRestrictions.includes(command)) toUnrestrict.push(command);
    }

    const finalRestrictions = existingRestrictions.filter(
      (curr) => !toUnrestrict.includes(curr)
    );

    await Server.findOneAndUpdate(
      { id: guildId },
      { commandRestrictions: finalRestrictions }
    );
  }
}
