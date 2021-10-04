import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message, TextChannel } from "discord.js";
import { bold } from "@discordjs/builders";

const twoWeeks = 1000 * 60 * 60 * 24 * 14;

@ApplyOptions<CommandOptions>({
  description:
    "Purges a certain number of messages sent by a user or everyone if no user is mentioned.",
  requiredUserPermissions: ["MANAGE_MESSAGES"],
  runIn: ["GUILD_TEXT"],
})
export class UserCommand extends Command {
  async run(msg: Message, args: Args) {
    const amount = await args.pick("number").catch(() => 100);

    const targetUserToRemove = msg.mentions.users;

    // const targetUserToRemove = await args.rest("member");
    await msg.channel.sendTyping();
    await msg.delete();

    const startTime = Date.now();

    let channelMessages = await msg.channel.messages.fetch({
      limit: amount,
    });

    if (!targetUserToRemove.size) {
      channelMessages = channelMessages.filter((foundMsg) => {
        return msg.mentions.users
          .map((user) => user.id)
          .includes(foundMsg.author.id);
      });
    }

    channelMessages = channelMessages.filter((channelMessage) => {
      return Date.now() - channelMessage.createdTimestamp < twoWeeks;
    });

    const deletedMessages = await (msg.channel as TextChannel).bulkDelete(
      channelMessages
        .map((channelMessage) => channelMessage.id)
        .slice(0, amount)
    );

    return await send(
      msg,
      `🗑 Deleted ${bold(deletedMessages.size.toString())} messages in **${bold(
        String((Date.now() - startTime) / 1000)
      )}** seconds.`
    );
  }
}
