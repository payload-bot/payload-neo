import { ApplyOptions, RequiresGuildContext, RequiresUserPermissions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import config from "#root/config";
import PayloadColors from "#utils/colors";
import { inlineCode } from "@discordjs/builders";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<PayloadCommand.Options>({
  description: LanguageKeys.Commands.Prefix.Description,
  detailedDescription: LanguageKeys.Commands.Prefix.DetailedDescription,
  runIn: ["GUILD_TEXT"],
  subCommands: [
    "set",
    "delete",
    { input: "update", output: "set" },
    { input: "remove", output: "delete" },
    { input: "view", output: "view", default: true },
  ],
})
export class UserCommand extends PayloadCommand {
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
      select: {},
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
      select: {},
    });

    return await send(msg, { embeds: [embed] });
  }
}
