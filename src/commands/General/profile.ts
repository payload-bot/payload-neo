import { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Args } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import PayloadColors from "#utils/colors";
import { User } from "#lib/models/User";

@ApplyOptions<CommandOptions>({
  description: "Gets user's profile.",
})
export class UserCommand extends Command {
  async run(msg: Message, args: Args) {
    const targetUser = await args.pick("user").catch(() => msg.author);
    let user =
      (await User.findOne({ id: targetUser.id }).lean().exec()) ??
      new User({ id: targetUser.id });

    const steamid = user.steamId;

    const description = `
    Bot: ${targetUser.bot ? "Yes" : "No"}
    ID: ${targetUser.id}
    Steam ID: ${steamid || "NOT SET"}
    Points: ${user.points ?? 0}
    `;

    const embed = new MessageEmbed({
      title: targetUser.tag,
      description,
      color: PayloadColors.USER,
      thumbnail: {
        url: targetUser.displayAvatarURL(),
      },
    });

    return await send(msg, {
      embeds: [embed],
    });
  }
}
