import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import { EmbedBuilder, Message } from "discord.js";
import PayloadColors from "#utils/colors.ts";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";
import { eq } from "drizzle-orm";
import { user } from "#root/drizzle/schema.ts";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Profile.Description,
  detailedDescription: LanguageKeys.Commands.Profile.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  override async messageRun(msg: Message, args: PayloadCommand.Args) {
    const targetUser = await args.pick("user").catch(() => msg.author);

    const { t } = args;

    const [u] = await this.database
      .select({ steamId: user.steamId, legacyPushed: user.legacyPushed })
      .from(user)
      .where(eq(user.id, targetUser.id));

    const botT = t(LanguageKeys.Commands.Profile.Bot);
    const pointsT = t(LanguageKeys.Commands.Profile.Points);

    const description = `
      ${botT}: ${targetUser.bot ? "Yes" : "No"}
      ID: ${targetUser.id}
      Steam ID: ${u?.steamId ?? "NOT SET"}
      ${pointsT}: ${u?.legacyPushed ?? 0}
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
