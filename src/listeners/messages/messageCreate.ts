import { messageIgnored } from "#root/lib/metrics.ts";
import { Events, Listener } from "@sapphire/framework";
import { type Message } from "discord.js";

export class MessageCreateListener extends Listener<typeof Events.MessageCreate> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.MessageCreate });
  }

  public run(message: Message) {
    if (message.author.bot || message.webhookId) {
      messageIgnored.inc({ reason: "pre_parse" });
      return;
    }

    this.container.client.emit(Events.PreMessageParsed, message);
  }
}
