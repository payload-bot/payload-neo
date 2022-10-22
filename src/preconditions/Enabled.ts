import { ApplyOptions } from "@sapphire/decorators";
import {
  AllFlowsPrecondition,
  ChatInputCommand,
  Command,
  ContextMenuCommand,
  Identifiers,
  Precondition,
} from "@sapphire/framework";
import type { CommandInteraction, ContextMenuInteraction, Message } from "discord.js";

@ApplyOptions<Precondition.Options>({ position: 10 })
export class UserPrecondition extends AllFlowsPrecondition {
  public override async messageRun(message: Message, command: Command, context: Precondition.Context) {
    return message.guild ? this.runGuild(message.guildId!, command, context) : this.runDM(command, context);
  }

  public override async chatInputRun(
    interaction: CommandInteraction,
    command: ChatInputCommand,
    context: Precondition.Context
  ) {
    return interaction.guild ? this.runGuild(interaction.guildId!, command, context) : this.runDM(command, context);
  }

  public override async contextMenuRun(
    interaction: ContextMenuInteraction,
    command: ContextMenuCommand,
    context: Precondition.Context
  ) {
    return interaction.guild ? this.runGuild(interaction.guildId!, command, context) : this.runDM(command, context);
  }

  private runDM(command: Command, context: Precondition.Context): Precondition.Result {
    return command.enabled ? this.ok() : this.error({ identifier: Identifiers.CommandDisabled, context });
  }

  private async runGuild(guildId: string, command: Command, context: Precondition.Context) {
    const server = await this.container.database.guild.findUnique({
      where: { id: guildId },
      select: { commandRestrictions: true },
    });

    if (server?.commandRestrictions?.some(restriction => restriction === command.name)) {
      return this.error({ context: { ...context, silent: true } });
    }

    return this.runDM(command, context);
  }
}
