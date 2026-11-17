import { LanguageKeys } from "#lib/i18n/all";
import config from "#root/config.ts";
import { Events, Listener } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { fetchT } from "@sapphire/plugin-i18next";
import { inlineCode, type Message } from "discord.js";
import { eq } from "drizzle-orm";
import { guild } from "../db/schema/guild.ts";

export class UserListener extends Listener<typeof Events.MentionPrefixOnly> {
  public async run(msg: Message) {
    const [g] = await this.container.database
      .select({ prefix: guild.prefix })
      .from(guild)
      .where(eq(guild.id, msg.guildId!));

    const t = await fetchT(msg);

    const content = t(LanguageKeys.Commands.Prefix.CurrentPrefix, {
      prefix: inlineCode(g?.prefix ?? config.PREFIX),
    });

    return await send(msg, content);
  }
}
