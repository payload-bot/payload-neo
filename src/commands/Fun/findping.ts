import { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import {
  getPingCache,
  pingChannelCacheExists,
  renderMessage,
} from "#utils/snipeCache";
import type { PayloadClient } from "#lib/PayloadClient";

@ApplyOptions<CommandOptions>({
  description:
    "Retrieves the latest (or number [number]) deleted/edited message from the past 5 minutes.",
  runIn: ["GUILD_TEXT"],
  aliases: ["ping"],
})
export class UserCommand extends Command {
  async run(msg: Message) {
    const client = this.container.client as PayloadClient;

    if (
      !pingChannelCacheExists(client, msg) ||
      getPingCache(client, msg).size == 0
    ) {
      return await send(msg, "no ping");
    }

    await msg.channel.sendTyping();

    const targetMessages = getPingCache(client, msg).filter(
      (message) =>
        !!message.mentions.members!.find((member) => member.id == msg.author.id)
    );

    if (targetMessages.size < 1) {
      return await send(msg, "no pings");
    }

    const targetMessage = targetMessages.last()!;

    const msgData = await renderMessage(targetMessage);

    await msg.channel.send({
      files: [msgData.buffer],
    });

    if (msgData.attachments || msgData.links) {
      await msg.channel.send(msgData.attachments + "\n" + msgData.links);
    }

    return true;
  }
}
