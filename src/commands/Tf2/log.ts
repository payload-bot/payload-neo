import { BucketScope, type CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import config from "#root/config";
import { capturePage } from "#utils/screenshot";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { eq } from "drizzle-orm";
import { user } from "#root/drizzle/schema";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Log.Description,
  detailedDescription: LanguageKeys.Commands.Log.DetailedDescription,
  cooldownDelay: 1500,
  cooldownLimit: 1,
  cooldownScope: BucketScope.User,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const { id, tag } = await args.pick("user").catch(() => msg.author);

    await msg.channel.sendTyping();

    const [{ steamId }] = await this.database.select({ steamId: user.steamId }).from(user).where(eq(user.id, id));

    if (steamId == null) {
      await send(msg, args.t(LanguageKeys.Commands.Log.NoIdLinked, { user: tag }));
      return;
    }

    const { logs } = await fetch<any>(`http://logs.tf/api/v1/log?limit=1&player=${steamId}`, FetchResultTypes.JSON);

    if (!logs.length) {
      await send(msg, args.t(LanguageKeys.Commands.Log.NoHistory));
      return;
    }

    const logID = logs[logs.length - 1].id;

    const screenshotBuffer = await capturePage(`http://logs.tf/${logID}#${steamId}`, {
      top: {
        selector: "#log-header",
        edge: "top",
      },
      left: {
        selector: "#log-header",
        edge: "left",
      },
      right: {
        selector: "#log-header",
        edge: "right",
      },
      bottom: {
        selector: "#log-section-players",
        edge: "bottom",
      },

      cssPath: config.files.LOGS_CSS,
    });

    const linkButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        label: args.t(LanguageKeys.Commands.Log.Button),
        url: `http://logs.tf/${logID}#${user.steamId}`,
        style: ButtonStyle.Link,
      }),
    );

    await send(msg, {
      files: [screenshotBuffer],
      components: [linkButton],
    });
  }
}
