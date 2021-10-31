import type { AutoResponseStore } from "#lib/structs/AutoResponse/AutoResponseStore";
import { Events, Listener } from "@sapphire/framework";
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
    // @TODO: Split into listners
    for (const autoResponse of autoResponses.values()) {
      const doesMatch = autoResponse.shouldRun(message);

      if (!doesMatch) continue;

      const context = {
        commandName: autoResponse.name,
        prefix: autoResponse.getMatch(message),
        commandPrefix: autoResponse.getMatch(message),
      };

      const args = await autoResponse.preParse(
        message,
        message.content,
        context
      );

      // Run global preconditions:
      const globalResult = await this.container.stores
        .get("preconditions")
        .run(message, autoResponse, { message, command: autoResponse });

      if (!globalResult.success) {
        this.container.client.emit(Events.CommandDenied, globalResult.error, {
          message,
          command: autoResponse,
          context,
          parameters: "",
        });

        return;
      }

      // Run command-specific preconditions:
      const localResult = await autoResponse.preconditions.run(
        message,
        autoResponse,
        { message, command: autoResponse }
      );
      if (!localResult.success) {
        this.container.client.emit(Events.CommandDenied, localResult.error, {
          message,
          command: autoResponse,
          context,
          parameters: "",
        });
        return;
      }

      return await autoResponse.messageRun(message, args, context);
    }
  }
}
