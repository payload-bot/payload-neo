import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";

@ApplyOptions<CommandOptions>({
  description: "Information about the Payload client",
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message) {
    const { client } = this.container;

    const membersServing = client.guilds.cache.reduce(
      (acc, val) => acc + (val.memberCount ?? 0),
      0
    );

    const guildsServing = client.guilds.cache.size;
    const guildPrefix = await client.fetchPrefix(msg);

    const embed = new MessageEmbed({
      author: {
        name: client.user!.username,
        iconURL: client.user!.displayAvatarURL(),
      },
      title: `Serving ${membersServing} users in ${guildsServing} servers!`,
      description: `Join the official %user discord server for help and suggestions: https://payload.tf/discord\n\nInvite %user to your server with ${guildPrefix}!\nHelp translate for Payload: https://crowdin.com/project/payload\n\nA huge thanks to: miko, supra, spaenny, Elias and 24 for helping with translations!`,
    });

    return await send(msg, { embeds: [embed] });
  }
}
