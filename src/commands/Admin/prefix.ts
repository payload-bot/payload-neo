import {
  ApplyOptions,
  RequiresGuildContext,
  RequiresUserPermissions,
} from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { Server } from "#lib/models/Server";
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
    const server = await Server.findOne({ id: msg.guild!.id }).lean();

    const content = args.t(LanguageKeys.Commands.Prefix.CurrentPrefix, {
      prefix: inlineCode(server?.prefix ?? config.PREFIX),
    });

    return await send(msg, content);
  }

  @RequiresGuildContext()
  @RequiresUserPermissions(["ADMINISTRATOR"])
  async set(msg: Message, args: PayloadCommand.Args) {
    const server = await Server.findOne({ id: msg.guild!.id }).lean();
    const prefix = await args.pick("string").catch(() => null);

    const { t } = args;

    if (!prefix) {
      return await send(msg, t(LanguageKeys.Commands.Prefix.SetNeedsArgs));
    }

    if (server?.prefix === prefix) {
      return await send(msg, t(LanguageKeys.Commands.Prefix.SetSamePrefix));
    }

    await Server.findOneAndUpdate({ id: msg.guild!.id }, { prefix });

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
      color: PayloadColors.ADMIN,
    });

    return await send(msg, { embeds: [embed] });
  }

  @RequiresGuildContext()
  @RequiresUserPermissions(["ADMINISTRATOR"])
  async delete(msg: Message, args: PayloadCommand.Args) {
    const server = await Server.findOne({ id: msg.guild!.id }).lean();
    const { t } = args;

    if (server?.prefix === config.PREFIX) {
      return await send(
        msg,
        t(LanguageKeys.Commands.Prefix.DeleteAlreadyDefault)
      );
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
      color: PayloadColors.ADMIN,
    });

    await Server.findOneAndUpdate(
      { id: msg.guild!.id },
      { prefix: config.PREFIX }
    );

    return await send(msg, { embeds: [embed] });
  }
}
