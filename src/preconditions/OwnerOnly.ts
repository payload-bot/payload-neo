import config from "#/config";
import { Precondition } from "@sapphire/framework";
import type { Message } from "discord.js";

export class UserPrecondition extends Precondition {
  public async run(message: Message) {
    return config.allowedID === message.author.id
      ? this.ok()
      : this.error({ context: { silent: true } });
  }
}
