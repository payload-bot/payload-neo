import { BucketScope, type CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import config from "#root/config.ts";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";
import { eq } from "drizzle-orm";
import { search } from "@tf2software/logstf";
import { user } from "#root/drizzle/schema.ts";
import PayloadColors from "#utils/colors.ts";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Log.Description,
  detailedDescription: LanguageKeys.Commands.Log.DetailedDescription,
  cooldownDelay: 1500,
  cooldownLimit: 1,
  cooldownScope: BucketScope.User,
  typing: true,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const { id, tag } = await args.pick("user").catch(() => msg.author);

    const [{ steamId }] = await this.database.select({ steamId: user.steamId }).from(user).where(eq(user.id, id));

    if (steamId == null) {
      await send(msg, args.t(LanguageKeys.Commands.Log.NoIdLinked, { user: tag }));
      return;
    }

    const { logs } = await search({ limit: 1, player: [steamId] });

    if (!logs.length) {
      await send(msg, args.t(LanguageKeys.Commands.Log.NoHistory));
      return;
    }

    const logID = logs[0].id;

  //   const screenshotBuffer = await capturePage(`http://logs.tf/${logID}#${steamId}`, {
  //     top: {
  //       selector: "#log-header",
  //       edge: "top",
  //     },
  //     left: {
  //       selector: "#log-header",
  //       edge: "left",
  //     },
  //     right: {
  //       selector: "#log-header",
  //       edge: "right",
  //     },
  //     bottom: {
  //       selector: "#log-section-players",
  //       edge: "bottom",
  //     },

  //     cssPath: config.files.LOGS_CSS,
  //   });

  //   const att = new AttachmentBuilder(Buffer.from(screenshotBuffer), { name: "log.webp" });

  //   const embed = new EmbedBuilder({
  //     color: PayloadColors.Command,
  //     title: args.t(LanguageKeys.Auto.Logs.EmbedTitle),
  //     url: `https://logs.tf/${logID}`,
  //     image: { url: "attachment://log.webp" },
  //     timestamp: new Date(),
  //   });

  //   await send(msg, {
  //     embeds: [embed],
  //     files: [att],
  //   });
  }
}
