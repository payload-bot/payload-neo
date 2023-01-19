import { ApplyOptions, RequiresGuildContext, RequiresUserPermissions } from "@sapphire/decorators";
import { Message, EmbedBuilder } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import config from "#root/config";
import PayloadColors from "#utils/colors";
import { inlineCode } from "@discordjs/builders";
import { LanguageKeys } from "#lib/i18n/all";
import { Subcommand, SubcommandMappingArray } from "@sapphire/plugin-subcommands";
import { Args, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import { PermissionFlagsBits } from "discord-api-types/v9";

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
    const server = await this.database.guild.findUnique({ where: { id: msg.guildId! }, select: { prefix: true } });
    const t = await this.t(msg);

    const content = t(LanguageKeys.Commands.Prefix.CurrentPrefix, {
      prefix: inlineCode(server?.prefix ?? config.PREFIX),
    });

    return await send(msg, content);
  }

  @RequiresGuildContext()
  @RequiresUserPermissions([PermissionFlagsBits.Administrator])
  async set(msg: Message, args: Args) {
    const server = await this.database.guild.findUnique({ where: { id: msg.guildId! }, select: { prefix: true } });
    const prefix = await args.pick("string").catch(() => null);

    const t = await this.t(msg);

    if (!prefix) {
      return await send(msg, t(LanguageKeys.Commands.Prefix.SetNeedsArgs));
    }

    if (server?.prefix === prefix) {
      return await send(msg, t(LanguageKeys.Commands.Prefix.SetSamePrefix));
    }

    await this.database.guild.upsert({
      where: { id: msg.guildId! },
      update: { prefix },
      create: { id: msg.guildId!, prefix },
    });

    const embed = new EmbedBuilder({
      author: {
        name: msg.author.tag,
        iconURL: msg.author.displayAvatarURL(),
      },
      title: t(LanguageKeys.Commands.Prefix.SetPrefixEmbedTitle, {
        user: msg.author.tag,
      }),
      description: t(LanguageKeys.Commands.Prefix.SetPrefixEmbedDesc, {
        old: inlineCode(server?.prefix ?? config.PREFIX),
        new: inlineCode(prefix),
      }),
      timestamp: new Date(),
      color: PayloadColors.Admin,
    });

    return await send(msg, { embeds: [embed] });
  }

  @RequiresGuildContext()
  @RequiresUserPermissions([PermissionFlagsBits.Administrator])
  async delete(msg: Message) {
    const server = await this.database.guild.findUnique({ where: { id: msg.guildId! }, select: { prefix: true } });
    const t = await this.t(msg);

    if (server?.prefix === config.PREFIX) {
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
        old: inlineCode(server?.prefix ?? config.PREFIX),
        new: inlineCode(config.PREFIX),
      }),
      timestamp: new Date(),
      color: PayloadColors.Admin,
    });

    await this.database.guild.upsert({
      where: { id: msg.guildId! },
      update: { prefix: config.PREFIX },
      create: { id: msg.guildId! },
    });

    return await send(msg, { embeds: [embed] });
  }
}
