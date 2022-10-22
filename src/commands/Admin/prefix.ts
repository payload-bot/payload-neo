import { ApplyOptions, RequiresGuildContext, RequiresUserPermissions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import config from "#root/config";
import PayloadColors from "#utils/colors";
import { inlineCode } from "@discordjs/builders";
import { LanguageKeys } from "#lib/i18n/all";
import type { SubcommandMappingArray } from "@sapphire/plugin-subcommands";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";

@ApplyOptions<PayloadCommand.Options>({
  description: LanguageKeys.Commands.Prefix.Description,
  detailedDescription: LanguageKeys.Commands.Prefix.DetailedDescription,
  runIn: [CommandOptionsRunTypeEnum.GuildText],
})
export class UserCommand extends PayloadCommand {
  readonly subcommandMappings: SubcommandMappingArray = [
    {
      name: "view",
      type: "method",
      messageRun: (msg, args) => this.view(msg, args),
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
      messageRun: (msg, args) => this.delete(msg, args),
    },
    {
      name: "remove",
      type: "method",
      messageRun: (msg, args) => this.delete(msg, args),
    },
  ];

  @RequiresGuildContext()
  async view(msg: Message, args: PayloadCommand.Args) {
    const server = await this.database.guild.findUnique({ where: { id: msg.guildId! }, select: { prefix: true } });

    const content = args.t(LanguageKeys.Commands.Prefix.CurrentPrefix, {
      prefix: inlineCode(server?.prefix ?? config.PREFIX),
    });

    return await send(msg, content);
  }

  @RequiresGuildContext()
  @RequiresUserPermissions(["ADMINISTRATOR"])
  async set(msg: Message, args: PayloadCommand.Args) {
    const server = await this.database.guild.findUnique({ where: { id: msg.guildId! }, select: { prefix: true } });
    const prefix = await args.pick("string").catch(() => null);

    const { t } = args;

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

    const embed = new MessageEmbed({
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
  @RequiresUserPermissions(["ADMINISTRATOR"])
  async delete(msg: Message, args: PayloadCommand.Args) {
    const server = await this.database.guild.findUnique({ where: { id: msg.guildId! }, select: { prefix: true } });
    const { t } = args;

    if (server?.prefix === config.PREFIX) {
      return await send(msg, t(LanguageKeys.Commands.Prefix.DeleteAlreadyDefault));
    }

    const embed = new MessageEmbed({
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
