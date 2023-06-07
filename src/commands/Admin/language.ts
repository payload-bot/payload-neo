import { ApplyOptions, RequiresGuildContext, RequiresUserPermissions } from "@sapphire/decorators";
import { Message, EmbedBuilder } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import PayloadColors from "#utils/colors";
import { inlineCode } from "@discordjs/builders";
import { LanguageKeys } from "#lib/i18n/all";
import { Subcommand, type SubcommandMappingArray } from "@sapphire/plugin-subcommands";
import { Args, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import { PermissionFlagsBits } from "discord-api-types/v9";

@ApplyOptions<Subcommand.Options>({
  description: LanguageKeys.Commands.Language.Description,
  detailedDescription: LanguageKeys.Commands.Language.DetailedDescription,
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
    const server = await this.database.guild.findUnique({ where: { id: msg.guildId! }, select: { language: true } });
    const t = await this.t(msg);

    const content = t(LanguageKeys.Commands.Language.CurrentLanguage, {
      language: inlineCode(server?.language ?? "en-US"),
    });

    return await send(msg, content);
  }

  @RequiresGuildContext()
  @RequiresUserPermissions([PermissionFlagsBits.Administrator])
  async set(msg: Message, args: Args) {
    const server = await this.database.guild.findUnique({ where: { id: msg.guildId! }, select: { language: true } });
    const language = await args
      .pick("enum", { enum: ["en-US", "es-ES", "fi-FI", "pl-PL", "ru-RU", "de-DE"] })
      .catch(() => null);

    const t = await this.t(msg);

    if (!language) {
      return await send(msg, t(LanguageKeys.Commands.Language.SetNeedsArgs));
    }

    if (server?.language === language) {
      return await send(msg, t(LanguageKeys.Commands.Language.SetSameLanguage));
    }

    await this.database.guild.upsert({
      where: { id: msg.guildId! },
      update: { language },
      create: { id: msg.guildId!, language },
    });

    const embed = new EmbedBuilder({
      author: {
        name: msg.author.tag,
        iconURL: msg.author.displayAvatarURL(),
      },
      title: t(LanguageKeys.Commands.Language.SetLanguageEmbedTitle, {
        user: msg.author.tag,
      }),
      description: t(LanguageKeys.Commands.Language.SetLanguageEmbedDesc, {
        old: inlineCode(server?.language ?? "en-US"),
        new: inlineCode(language),
      }),
      timestamp: new Date(),
      color: PayloadColors.Admin,
    });

    return await send(msg, { embeds: [embed] });
  }

  @RequiresGuildContext()
  @RequiresUserPermissions([PermissionFlagsBits.Administrator])
  async delete(msg: Message) {
    const server = await this.database.guild.findUnique({ where: { id: msg.guildId! }, select: { language: true } });
    const t = await this.t(msg);

    if (server === null || server.language === "en-US") {
      return await send(msg, t(LanguageKeys.Commands.Language.DeleteAlreadyDefault));
    }

    const embed = new EmbedBuilder({
      author: {
        name: msg.author.tag,
        iconURL: msg.author.displayAvatarURL(),
      },
      title: t(LanguageKeys.Commands.Language.SetLanguageEmbedTitle, {
        user: msg.author.tag,
      }),
      description: t(LanguageKeys.Commands.Language.SetLanguageEmbedDesc, {
        old: inlineCode(server?.language ?? "en-US"),
        new: inlineCode("en-US"),
      }),
      timestamp: new Date(),
      color: PayloadColors.Admin,
    });

    await this.database.guild.update({
      where: { id: msg.guildId! },
      data: { language: "en-US" },
    });

    return await send(msg, { embeds: [embed] });
  }
}
