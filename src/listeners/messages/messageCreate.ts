import type { AutoResponseStore } from "#lib/structs/AutoResponse/AutoResponseStore";
import { Events, Listener } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import type { Message } from "discord.js";

export class UserListener extends Listener<typeof Events.MessageCreate> {
  public async run(message: Message) {
    // If the message was sent by a webhook, return:
    if (message.webhookId !== null) return;

    // If the message was sent by the system, return:
    if (message.system) return;

    // If the message was sent by a bot, return:
    if (message.author.bot) return;

    const { client } = this.container;

    const autoResponses = client.stores.get(
      "autoresponses" as any
    ) as AutoResponseStore;
    
    // Check auto responses
    for (const autoResponse of autoResponses.values()) {
      const doesMatch = autoResponse.shouldRun(message);

      if (!doesMatch) continue;
      const t = await fetchT(message);

      return await autoResponse.messageRun(message, t);
    }
  }
}
