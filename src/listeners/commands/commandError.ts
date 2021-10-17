import {
  Args,
  ArgumentError,
  CommandErrorPayload,
  Events,
  Listener,
  UserError,
} from "@sapphire/framework";
import { DiscordAPIError, HTTPError, Message } from "discord.js";
import { RESTJSONErrorCodes } from "discord-api-types/rest/v9";

const ignoredCodes = [
  RESTJSONErrorCodes.UnknownChannel,
  RESTJSONErrorCodes.UnknownMessage,
];

export class UserListener extends Listener<typeof Events.CommandError> {
  run(error: Error, { message, args }: CommandErrorPayload<Args>) {
    const { client, logger } = this.container;

    if (typeof error === "string") return;
    if (error instanceof ArgumentError) return;
    if (error instanceof UserError) return;

    // Extract useful information about the DiscordAPIError
    if (error instanceof DiscordAPIError || error instanceof HTTPError) {
      if (this.isSilencedError(args, error)) return;
      client.emit(Events.Error, error);
    } else {
      logger.warn(
        `${this.getWarnError(message)} (${message.author.id}) | ${
          error.constructor.name
        }`
      );
    }
  }

  private isSilencedError(args: Args, error: DiscordAPIError | HTTPError) {
    return (
      // If it's an unknown channel or an unknown message, ignore:
      ignoredCodes.includes(error.code) ||
      // If it's a DM message reply after a block, ignore:
      this.isDirectMessageReplyAfterBlock(args, error)
    );
  }

  private getWarnError(message: Message) {
    return `ERROR: /${
      message.guild
        ? `${message.guild.id}/${message.channel.id}`
        : `DM/${message.author.id}`
    }/${message.id}`;
  }

  private isDirectMessageReplyAfterBlock(
    args: Args,
    error: DiscordAPIError | HTTPError
  ) {
    // When sending a message to a user who has blocked the bot, Discord replies with 50007 "Cannot send messages to this user":
    if (error.code !== RESTJSONErrorCodes.CannotSendMessagesToThisUser)
      return false;

    // If it's not a Direct Message, return false:
    if (args.message.guild !== null) return false;

    // If the query was made to the message's channel, then it was a DM response:
    return error.path === `/channels/${args.message.channel.id}/messages`;
  }
}
