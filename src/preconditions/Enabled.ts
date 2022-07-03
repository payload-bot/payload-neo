import { ApplyOptions } from "@sapphire/decorators";
import { Command, Identifiers, Precondition } from "@sapphire/framework";
import type { Message } from "discord.js";

@ApplyOptions<Precondition.Options>({ position: 10 })
export class UserPrecondition extends Precondition {
  public run(message: Message, command: Command, context: Precondition.Context): Precondition.Result {
    return message.guild ? this.runGuild(message, command, context) : this.runDM(command, context);
  }

  private runDM(command: Command, context: Precondition.Context): Precondition.Result {
    return command.enabled ? this.ok() : this.error({ identifier: Identifiers.CommandDisabled, context });
  }

  private async runGuild(msg: Message, command: Command, context: Precondition.Context) {
    const server = await this.container.database.guild.findUnique({
      where: { id: msg.guildId! },
      select: { commandRestrictions: true },
    });

    if (server?.commandRestrictions?.some(restriction => restriction === command.name)) {
      return this.error({ context: { ...context, silent: true } });
    }

    return this.runDM(command, context);
  }
}
