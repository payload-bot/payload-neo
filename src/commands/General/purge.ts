import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import type { TextChannel } from "discord.js";

@ApplyOptions<CommandOptions>({
  description:
    "Purges a certain number of messages sent by a user or everyone if no user is mentioned.",
  requiredUserPermissions: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
})
export class UserCommand extends Command {
  async run(msg: Message, args: Args) {
    const amount = await args.pick("number");

    if (!amount) return;
    const users = msg.mentions.users;

    await msg.channel.sendTyping();

    await msg.delete();

    const startTime = Date.now();

    let channelMessages = await msg.channel.messages.fetch({
      limit: 100,
    });

    if (users.size > 0) {
      channelMessages = channelMessages.filter((foundMsg) => {
        return msg.mentions.users
          .map((user) => user.id)
          .includes(foundMsg.author.id);
      });
    }

    channelMessages = channelMessages.filter((channelMessage) => {
      return (
        Date.now() - channelMessage.createdTimestamp < 1000 * 60 * 60 * 24 * 14
      );
    });

    const deletedMessages = await (msg.channel as TextChannel).bulkDelete(
      channelMessages
        .map((channelMessage) => channelMessage.id)
        .slice(0, amount as number)
    );

    return await await send(
      msg,
      `🗑 Deleted **${deletedMessages.size}** messages in **${String(
        (Date.now() - startTime) / 1000
      )}** seconds.`
    );
  }
}
