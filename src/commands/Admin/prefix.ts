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

@ApplyOptions<PayloadCommand.Options>({
  description: "Sets, deletes, or views the current prefix of the server.",
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
  async view(msg: Message) {
    const server = await Server.findOne({ id: msg.guild!.id }).lean().exec();

    return await send(msg, inlineCode(server?.prefix ?? config.PREFIX));
  }

  @RequiresGuildContext()
  @RequiresUserPermissions(["ADMINISTRATOR"])
  async set(msg: Message, args: PayloadCommand.Args) {
    const server = await Server.findOne({ id: msg.guild!.id }).lean().exec();
    const prefix = await args.pick("string").catch(() => null);

    if (!prefix) {
      return await send(msg, "please specify a new prefix");
    }

    if (server?.prefix === prefix) {
      return await send(msg, "that's already your prefix");
    }

    const embed = new MessageEmbed({
      author: {
        name: msg.author.tag,
        iconURL: msg.author.displayAvatarURL(),
      },
      title: "set prefix",
      description: "someone set the prefix",
      timestamp: new Date(),
      color: PayloadColors.ADMIN,
    });

    await Server.findOneAndUpdate({ id: msg.guild!.id }, { prefix });

    return await send(msg, { embeds: [embed] });
  }

  @RequiresGuildContext()
  @RequiresUserPermissions(["ADMINISTRATOR"])
  async delete(msg: Message) {
    // TODO: old => new const server = await Server.findOne({ id: msg.guild!.id }).lean().exec();

    const embed = new MessageEmbed({
      author: {
        name: msg.author.tag,
        iconURL: msg.author.displayAvatarURL(),
      },
      title: "delete prefix",
      description: "someone delete the prefix",
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
