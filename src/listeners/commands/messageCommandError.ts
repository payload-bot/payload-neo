import { Args, ArgumentError, type MessageCommandErrorPayload, Events, Listener, UserError } from "@sapphire/framework";
import { DiscordAPIError, HTTPError, Message } from "discord.js";
import { RESTJSONErrorCodes } from "discord-api-types/rest/v9";
import type { TFunction } from "@sapphire/plugin-i18next";
import { mapIdentifier } from "#lib/i18n/mapping.ts";
import { cutText } from "@sapphire/utilities";
import type { PayloadArgs } from "#lib/structs/commands/PayloadArgs.ts";
import { send } from "@sapphire/plugin-editable-commands";

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export class UserListener extends Listener<typeof Events.MessageCommandError> {
  async run(error: Error, { message, args }: MessageCommandErrorPayload) {
    const { client, logger } = this.container;
    const t = (args as PayloadArgs).t;

    if (typeof error === "string") return logger.error(`Unhandled string error:\n${error}`);
    if (error instanceof ArgumentError) return await this.argumentError(message, t, error);
    if (error instanceof UserError) return await this.userError(message, t, error);

    // Extract useful information about the DiscordAPIError
    if (error instanceof DiscordAPIError || error instanceof HTTPError) {
      if (this.isSilencedError(args as Args, error)) return;
      client.emit(Events.Error, error);
    } else {
      logger.warn(`${this.getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
      logger.info(error.stack);
    }

    return undefined;
  }

  private isSilencedError(args: Args, error: DiscordAPIError | HTTPError) {
    return (
      // If it's an unknown channel or an unknown message, ignore:
      ignoredCodes.includes(error.status) ||
      // If it's a DM message reply after a block, ignore:
      this.isDirectMessageReplyAfterBlock(args, error)
    );
  }

  private getWarnError(message: Message) {
    return `ERROR: /${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${
      message.id
    }`;
  }

  private isDirectMessageReplyAfterBlock(args: Args, error: DiscordAPIError | HTTPError) {
    // When sending a message to a user who has blocked the bot, Discord replies with 50007 "Cannot send messages to this user":
    if (error.status !== RESTJSONErrorCodes.CannotSendMessagesToThisUser) return false;

    // If it's not a Direct Message, return false:
    if (args.message.guild !== null) return false;

    // If the query was made to the message's channel, then it was a DM response:
    return error.url === `/channels/${args.message.channel.id}/messages`;
  }

  private async argumentError(message: Message, t: TFunction, error: ArgumentError<unknown>) {
    const argument = error.argument.name;
    const identifier = mapIdentifier(error.identifier);
    const parameter = error.parameter.replaceAll("`", "῾");
    const content = t(identifier, {
      ...error,
      ...(error.context as object),
      argument,
      parameter: cutText(parameter, 50),
    });
    return await send(message, content);
  }

  private async userError(message: Message, t: TFunction, error: UserError) {
    if (Reflect.get(Object(error.context), "silent")) return;

    const identifier = mapIdentifier(error.identifier);

    return await send(
      message,
      t(identifier, {
        // deno-lint-ignore no-explicit-any
        ...(error.context as any),
      }) as unknown as string,
    );
  }
}
