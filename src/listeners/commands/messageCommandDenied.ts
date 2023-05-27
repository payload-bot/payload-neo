import { mapIdentifier } from "#lib/i18n/mapping";
import { type MessageCommandDeniedPayload, Events, Listener, UserError } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import type { Message } from "discord.js";

export class UserListener extends Listener<typeof Events.MessageCommandDenied> {
  public async run(error: UserError, { message, command }: MessageCommandDeniedPayload) {
    if (Reflect.get(Object(error.context), "silent")) return;

    const indentifier = mapIdentifier(error.identifier);
    const content = await resolveKey(message, indentifier, { message, command, ...(error.context as any) });

    return await this.alert(message, content);
  }

  private async alert(message: Message, content: string) {
    return await message.channel.send({
      content,
      allowedMentions: { users: [message.author.id], roles: [] },
    });
  }
}
