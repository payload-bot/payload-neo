import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import { MessageEmbed, Message } from "discord.js";
import PayloadColors from "#utils/colors";
import { User } from "#lib/models/User";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Profile.Description,
  detailedDescription: LanguageKeys.Commands.Profile.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const targetUser = await args.pick("user").catch(() => msg.author);

    const { t } = args;

    const user = await User.findOne({ id: targetUser.id }).lean();

    const botT = t(LanguageKeys.Commands.Profile.Bot);
    const pointsT = t(LanguageKeys.Commands.Profile.Points);

    const description = `
      ${botT}: ${targetUser.bot ? "Yes" : "No"}
      ID: ${targetUser.id}
      Steam ID: ${user?.steamId || "NOT SET"}
      ${pointsT}: ${user?.fun?.payload?.feetPushed ?? 0}
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
