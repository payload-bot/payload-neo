import { CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { channelCacheExists, getCache, renderMessage } from "#utils/snipeCache";
import type { PayloadClient } from "#lib/PayloadClient";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";
import { PermissionFlagsBits } from "discord-api-types/v9";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Snipe.Description,
  detailedDescription: LanguageKeys.Commands.Snipe.DetailedDescription,
  runIn: [CommandOptionsRunTypeEnum.GuildText],
  requiredClientPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles],
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const guildSetting = await this.database.guild.findUnique({
      where: { id: msg.guildId! },
      select: { enableSnipeForEveryone: true },
    });

    if (guildSetting?.enableSnipeForEveryone == null || !guildSetting.enableSnipeForEveryone) {
      if (!msg.member!.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return;
      }
    }

    const number = await args.pick("integer", { minimum: 1, maximum: 5 }).catch(() => 1);

    const client = this.container.client as PayloadClient;

    if (!channelCacheExists(client, msg) || getCache(client, msg).size == 0) {
      await send(msg, args.t(LanguageKeys.Commands.Snipe.NoMessages));
      return;
    }

    await msg.channel.sendTyping();

    const cache = getCache(client, msg);

    const max = cache.size;

    if (number > max) {
      await send(msg, args.t(LanguageKeys.Commands.Snipe.AboveCacheAmount, { count: max }));
      return;
    }

    const ids = [...cache.keys()];
    const targetMessage = cache.get(ids[max - number])!;

    const snipeData = await renderMessage(targetMessage);

    await msg.channel.send({
      files: [snipeData.buffer],
    });

    if (snipeData.attachments || snipeData.links) {
      await msg.channel.send(snipeData.attachments + "\n" + snipeData.links);
    }
  }
}
