import { AllFlowsPrecondition } from "@sapphire/framework";
import { envParseArray } from "@skyra/env-utilities";
import type { CommandInteraction, ContextMenuInteraction, Message } from "discord.js";

const OWNERS = envParseArray("OWNERS");

export class UserPrecondition extends AllFlowsPrecondition {
  public override messageRun = (msg: Message) => this.#checkOwner(msg.author.id);

  public override chatInputRun = (interaction: CommandInteraction) => this.#checkOwner(interaction.user.id);

  public override contextMenuRun = (interaction: ContextMenuInteraction) => this.#checkOwner(interaction.user.id);

  #checkOwner(authorId: string) {
    return OWNERS.includes(authorId) ? this.ok() : this.error({ context: { silent: true } });
  }
}
