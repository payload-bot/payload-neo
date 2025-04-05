import { ApplyOptions, RequiresGuildContext, RequiresUserPermissions } from "@sapphire/decorators";
import { Message, EmbedBuilder } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import config from "#root/config.ts";
import PayloadColors from "#utils/colors.ts";
import { inlineCode } from "@discordjs/builders";
import { LanguageKeys } from "#lib/i18n/all";
import { Subcommand, type SubcommandMappingArray } from "@sapphire/plugin-subcommands";
import { Args, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import { PermissionFlagsBits } from "discord-api-types/v9";
import { guild } from "#root/drizzle/schema.ts";
import { eq } from "drizzle-orm";

@ApplyOptions<Subcommand.Options>({
  description: LanguageKeys.Commands.Prefix.Description,
  detailedDescription: LanguageKeys.Commands.Prefix.DetailedDescription,
  runIn: [CommandOptionsRunTypeEnum.GuildText],
})
export class UserCommand extends Subcommand {
  private readonly database = this.container.database;
  private readonly t = async (msg: Message) => await fetchT(msg);

  readonly subcommandMappings: SubcommandMappingArray = [
    {
      name: "view",
      type: "method",
      messageRun: msg => this.view(msg),
      default: true,
    },
    {
      name: "set",
      type: "method",
      messageRun: (msg, args) => this.set(msg, args),
    },
    {
      name: "update",
      type: "method",
      messageRun: (msg, args) => this.set(msg, args),
    },
    {
      name: "delete",
      type: "method",
      messageRun: msg => this.delete(msg),
    },
    {
      name: "remove",
      type: "method",
      messageRun: msg => this.delete(msg),
    },
  ];

  @RequiresGuildContext()
  async view(msg: Message) {
    const [g] = await this.database
      .select({ prefix: guild.language })
      .from(guild)
      .where(eq(guild.id, msg.guildId!));

    const t = await this.t(msg);

    const content = t(LanguageKeys.Commands.Prefix.CurrentPrefix, {
      prefix: inlineCode(g?.prefix ?? config.PREFIX),
    });

    return await send(msg, content);
  }

  @RequiresGuildContext()
  @RequiresUserPermissions([PermissionFlagsBits.ManageGuild])
  async set(msg: Message, args: Args) {
    const [g] = await this.database
      .select({ guildPrefix: guild.language })
      .from(guild)
      .where(eq(guild.id, msg.guildId!));

    const prefix = await args.pick("string").catch(() => null);

    const t = await this.t(msg);

    if (!prefix) {
      return await send(msg, t(LanguageKeys.Commands.Prefix.SetNeedsArgs));
    }

    if (g?.guildPrefix === prefix) {
      return await send(msg, t(LanguageKeys.Commands.Prefix.SetSamePrefix));
    }

    await this.database
      .update(guild)
      .set({
        prefix,
      })
      .where(eq(guild.id, msg.guildId!));

    const embed = new EmbedBuilder({
      author: {
        name: msg.author.tag,
        iconURL: msg.author.displayAvatarURL(),
      },
      title: t(LanguageKeys.Commands.Prefix.SetPrefixEmbedTitle, {
        user: msg.author.tag,
      }),
      description: t(LanguageKeys.Commands.Prefix.SetPrefixEmbedDesc, {
        old: inlineCode(g?.guildPrefix ?? config.PREFIX),
        new: inlineCode(prefix),
      }),
      timestamp: new Date(),
      color: PayloadColors.Admin,
    });

    return await send(msg, { embeds: [embed] });
  }

  @RequiresGuildContext()
  @RequiresUserPermissions([PermissionFlagsBits.ManageGuild])
  async delete(msg: Message) {
    const [g] = await this.database
      .select({ guildPrefix: guild.language })
      .from(guild)
      .where(eq(guild.id, msg.guildId!));

    const t = await this.t(msg);

    if (g?.guildPrefix === config.PREFIX) {
      return await send(msg, t(LanguageKeys.Commands.Prefix.DeleteAlreadyDefault));
    }

    const embed = new EmbedBuilder({
      author: {
        name: msg.author.tag,
        iconURL: msg.author.displayAvatarURL(),
      },
      title: t(LanguageKeys.Commands.Prefix.SetPrefixEmbedTitle, {
        user: msg.author.tag,
      }),
      description: t(LanguageKeys.Commands.Prefix.SetPrefixEmbedDesc, {
        old: inlineCode(g.guildPrefix),
        new: inlineCode(config.PREFIX),
      }),
      timestamp: new Date(),
      color: PayloadColors.Admin,
    });

    await this.database
      .update(guild)
      .set({
        prefix: config.PREFIX,
      })
      .where(eq(guild.id, msg.guildId!));

    return await send(msg, { embeds: [embed] });
  }
}
