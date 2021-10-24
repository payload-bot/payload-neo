import type { CommandOptions, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import { MessageEmbed, Message } from "discord.js";
import PayloadColors from "#utils/colors";
import { User } from "#lib/models/User";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";

@ApplyOptions<CommandOptions>({
  description: "Gets user's profile.",
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: Args) {
    const { bot, id, tag, displayAvatarURL } = await args
      .pick("user")
      .catch(() => msg.author);

    const user = await User.findOne({ id }).lean()

    const description = `
      Bot: ${bot ? "Yes" : "No"}
      ID: ${id}
      Steam ID: ${user?.steamId || "NOT SET"}
      Points: ${user?.fun?.payload?.feetPushed ?? 0}
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
