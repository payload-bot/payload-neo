import { mapIdentifier } from "../../lib/i18n/mapping.ts";
import { type MessageCommandDeniedPayload, Events, Listener, UserError } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { resolveKey } from "@sapphire/plugin-i18next";
import type { Message } from "discord.js";

export class UserListener extends Listener<typeof Events.MessageCommandDenied> {
  public async run(error: UserError, { message, command }: MessageCommandDeniedPayload) {
    if (Reflect.get(Object(error.context), "silent")) return;

    const indentifier = mapIdentifier(error.identifier);
    const content = await resolveKey(message, indentifier, { message, command, ...(error.context as any) });

    return await this.alert(message, content as string);
  }

  private async alert(message: Message, content: string) {
    return await send(message, {
      content,
      allowedMentions: { users: [message.author.id], roles: [] },
    });
  }
}
