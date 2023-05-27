import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import { EmbedBuilder, Message } from "discord.js";
import PayloadColors from "#utils/colors";
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

    const user = await this.database.user.findUnique({
      where: { id: targetUser.id },
      select: { steamId: true, legacyPushed: true },
    });

    const botT = t(LanguageKeys.Commands.Profile.Bot);
    const pointsT = t(LanguageKeys.Commands.Profile.Points);

    const description = `
      ${botT}: ${targetUser.bot ? "Yes" : "No"}
      ID: ${targetUser.id}
      Steam ID: ${user?.steamId || "NOT SET"}
      ${pointsT}: ${user?.legacyPushed ?? 0}
    `;

    const embed = new EmbedBuilder({
      title: targetUser.tag,
      description,
      color: PayloadColors.User,
      thumbnail: {
        url: targetUser.displayAvatarURL(),
      },
    });

    await send(msg, {
      embeds: [embed],
    });
  }
}
