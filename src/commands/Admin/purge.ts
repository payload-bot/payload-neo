import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message, TextChannel } from "discord.js";
import { bold } from "@discordjs/builders";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

const twoWeeks = 1000 * 60 * 60 * 24 * 14;

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Purge.Description,
  detailedDescription: LanguageKeys.Commands.Purge.DetailedDescription,
  requiredUserPermissions: ["MANAGE_MESSAGES"],
  requiredClientPermissions: ["MANAGE_MESSAGES"],
  runIn: ["GUILD_TEXT"],
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    // Discord limitation (Prove me wrong.)
    const amount = await args.pick("number", { maximum: 100 }).catch(() => 100);

    const targetedUsersToRemove = msg.mentions.users;

    await msg.channel.sendTyping();
    await msg.delete();

    const startTime = Date.now();

    let channelMessages = await msg.channel.messages.fetch({
      limit: amount,
    });

    if (targetedUsersToRemove.size) {
      channelMessages = channelMessages.filter(foundMsg => {
        return msg.mentions.users.map(user => user.id).includes(foundMsg.author.id);
      });
    }

    channelMessages = channelMessages.filter(channelMessage => {
      return Date.now() - channelMessage.createdTimestamp < twoWeeks;
    });

    const deletedMessages = await (msg.channel as TextChannel).bulkDelete(
      channelMessages.map(channelMessage => channelMessage.id).slice(0, amount)
    );

    return await send(
      msg,
      args.t(LanguageKeys.Commands.Purge.Deleted, {
        count: deletedMessages.size,
        seconds: bold(String((Date.now() - startTime) / 1000)),
      })
    );
  }
}
