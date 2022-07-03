import { LanguageKeys } from "#lib/i18n/all";
import config from "#root/config";
import { inlineCode } from "@discordjs/builders";
import { Events, Listener } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { fetchT } from "@sapphire/plugin-i18next";
import type { Message } from "discord.js";

export class UserListener extends Listener<typeof Events.MentionPrefixOnly> {
  public async run(msg: Message) {
    const server = await this.container.database.guild.findUnique({
      where: { id: msg.guildId! },
      select: { prefix: true },
    });

    const t = await fetchT(msg);

    const content = t(LanguageKeys.Commands.Prefix.CurrentPrefix, {
      prefix: inlineCode(server?.prefix ?? config.PREFIX),
    });

    return await send(msg, content);
  }
}
