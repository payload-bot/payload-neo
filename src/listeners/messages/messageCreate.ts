import { Events, Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { commandCounter, messageIgnored, messageProcessed } from "#lib/metrics.ts";

export class UserListener extends Listener<typeof Events.MessageCreate> {
  public async run(message: Message) {
    messageProcessed.inc();

    if (message.webhookId !== null) {
      messageIgnored.inc({ reason: "webhook_null" });
      return;
    }

    if (message.system) {
      messageIgnored.inc({ reason: "system" });
      return;
    }
    if (message.author.bot) {
      messageIgnored.inc({ reason: "bot" });
      return;
    }

    const { client } = this.container;

    const autoResponses = client.stores.get("auto");

    // Check auto responses
    // @TODO: Split into listners
    for (const autoResponse of autoResponses.values()) {
      const doesMatch = autoResponse.shouldRun(message);

      if (!doesMatch) {
        continue;
      }

      const context = {
        commandName: autoResponse.name,
        matched: autoResponse.getMatch(message),
        prefix: autoResponse.getMatch(message)!,
        commandPrefix: autoResponse.getMatch(message)!,
      };

      // Run global preconditions:
      const globalResult = await this.container.stores
        .get("preconditions")
        .messageRun(message, autoResponse, { message, command: autoResponse });

      if (globalResult.isErr()) {
        this.container.client.emit(Events.MessageCommandDenied, globalResult.unwrapErr(), {
          message,
          command: autoResponse,
          context,
          parameters: "",
        });
      }

      // Run command-specific preconditions:
      const localResult = await autoResponse.preconditions.messageRun(message, autoResponse, {
        message,
        command: autoResponse,
      });

      if (localResult.isErr()) {
        this.container.client.emit(Events.MessageCommandDenied, localResult.unwrapErr(), {
          message,
          command: autoResponse,
          context,
          parameters: "",
        });

        return;
      }

      if (message.channel.isSendable()) {
        await message.channel.sendTyping();
      }

      const args = await autoResponse.messagePreParse(message, message.content, context);

      await commandCounter.inc({ command: context.commandName, auto: true });

      return await autoResponse.messageRun(message, args, context);
    }
  }
}
