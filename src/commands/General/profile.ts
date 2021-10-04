import { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Args } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { MessageEmbed, Message } from "discord.js";
import PayloadColors from "#utils/colors";
import { User } from "#lib/models/User";

@ApplyOptions<CommandOptions>({
  description: "Gets user's profile.",
})
export class UserCommand extends Command {
  async run(msg: Message, args: Args) {
    const { bot, id, tag, displayAvatarURL } = await args
      .pick("user")
      .catch(() => msg.author);

    const user = (await User.findOne({ id: id }).lean().exec()) ?? {};

    const steamid = user.steamId;

    const description = `
    Bot: ${bot ? "Yes" : "No"}
    ID: ${id}
    Steam ID: ${steamid || "NOT SET"}
    Points: ${user.points ?? 0}
    `;

    const embed = new MessageEmbed({
      title: tag,
      description,
      color: PayloadColors.USER,
      thumbnail: {
        url: displayAvatarURL(),
      },
    });

    return await send(msg, {
      embeds: [embed],
    });
  }
}
