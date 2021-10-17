import {
  CommandDeniedPayload,
  Events,
  Listener,
  UserError,
} from "@sapphire/framework";
import type { Message } from "discord.js";

export class UserListener extends Listener<typeof Events.CommandDenied> {
  public async run(error: UserError, { message }: CommandDeniedPayload) {
    if (Reflect.get(Object(error.context), "silent")) return;

    return this.alert(message, error.context as any);
  }

  private alert(message: Message, content: string) {
    return message.channel.send({
      content,
      allowedMentions: { users: [message.author.id], roles: [] },
    });
  }
}
