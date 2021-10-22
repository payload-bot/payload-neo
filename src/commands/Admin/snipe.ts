import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { Server } from "#lib/models/Server";
import { PermissionFlagsBits } from "discord-api-types";
import { channelCacheExists, getCache, renderMessage } from "#utils/snipeCache";

@ApplyOptions<CommandOptions>({
  description:
    "Retrieves the latest (or number [number]) deleted/edited message from the past 5 minutes.",
  runIn: ["GUILD_TEXT"],
})
export class UserCommand extends Command {
  async run(msg: Message, args: Args) {
    const guildSetting = await Server.findOne({ id: msg.guild!.id })
      .lean()
      .exec();

    if (!guildSetting?.enableSnipeForEveryone) {
      if (!msg.member!.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return;
      }
    }

    const number = await args.pick("number").catch(() => 1);
    const { client } = this.container;

    if (!channelCacheExists(client, msg) || getCache(client, msg).size == 0) {
      return await send(msg, "no messages");
    }

    await msg.channel.sendTyping();

    const cache = getCache(client, msg);

    const max = cache.size;

    if (number > max) {
      return await send(msg, "only have this many");
    }

    const ids = cache.keys();
    const targetMessage = cache.get(ids[max - number])!;

    const snipeData = await renderMessage(targetMessage);

    await msg.channel.send({
      files: [snipeData.buffer],
    });

    if (snipeData.attachments || snipeData.links) {
      await msg.channel.send(msg, snipeData.attachments + "\n" + snipeData.links);
    }

    return true;
  }
}
