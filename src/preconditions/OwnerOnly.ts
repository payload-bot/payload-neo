import { Precondition } from "@sapphire/framework";
import type { Message } from "discord.js";
import config from "#root/config";

export class UserPrecondition extends Precondition {
  public async run(message: Message) {
    return config.allowedID === message.author.id
      ? this.ok()
      : this.error({ context: { silent: true } });
  }
}
