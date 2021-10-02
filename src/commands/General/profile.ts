import { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { User } from "#lib/models/User";
import { MessageEmbed } from "discord.js";
import PayloadColors from "#utils/colors";

@ApplyOptions<CommandOptions>({
  description: "Gets user's profile.",
})
export class UserCommand extends Command {
  async run(msg: Message) {
    const profile = msg.mentions.users.first() || msg.author; // I don't think u can do pick for mentions
    let user = await User.findOne({ id: profile.id });

    if (!user) {
      user = new User({
        id: profile.id,
      });
    }

    const steamid = user.steamId;

    const description = `
    Bot: ${profile.bot ? "Yes" : "No"}
    ID: ${profile.id}
    Steam ID: ${steamid || "NOT SET"}
    Points: 0
    `;

    const embed = new MessageEmbed({
      title: profile.tag,
      description,
      color: PayloadColors.USER,
      thumbnail: {
        url: profile.displayAvatarURL(),
      },
    });

    return await send(msg, {
      embeds: [embed],
    });
  }
}
