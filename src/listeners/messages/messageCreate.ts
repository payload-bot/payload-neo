import { messageIgnored, messageProcessed } from "#root/lib/metrics.ts";
import { Events, Listener } from "@sapphire/framework";
import { type Message } from "discord.js";

export class MessageCreateListener extends Listener<typeof Events.MessageCreate> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.MessageCreate });
  }

  public run(message: Message) {
    messageProcessed.inc();

    if (message.author.bot) {
      messageIgnored.inc({ reason: "bot" });
      return;
    }

    if (message.webhookId) {
      messageIgnored.inc({ reason: "webhook" });
      return;
    }

    if (message.system) {
      messageIgnored.inc({ reason: "system" });
      return;
    }

    this.container.client.emit(Events.PreMessageParsed, message);
  }
}
