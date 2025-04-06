import { BucketScope, type CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";
import { eq } from "drizzle-orm";
import { search } from "@tf2software/logstf";
import { user } from "#root/drizzle/schema.ts";
import PayloadColors from "#utils/colors.ts";
import { Buffer } from "node:buffer";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Log.Description,
  detailedDescription: LanguageKeys.Commands.Log.DetailedDescription,
  cooldownDelay: 1500,
  cooldownLimit: 1,
  cooldownScope: BucketScope.User,
  typing: true,
})
export class UserCommand extends PayloadCommand {
  override async messageRun(msg: Message, args: PayloadCommand.Args) {
    const { id, tag } = await args.pick("user").catch(() => msg.author);

    const [{ steamId }] = await this.database.select({ steamId: user.steamId })
      .from(user).where(eq(user.id, id));

    if (steamId == null) {
      await send(
        msg,
        args.t(LanguageKeys.Commands.Log.NoIdLinked, { user: tag }),
      );
      return;
    }

    const { logs } = await search({ limit: 1, player: [steamId] });

    if (!logs.length) {
      await send(msg, args.t(LanguageKeys.Commands.Log.NoHistory));
      return;
    }

    const logID = logs[0].id;
    const logsUrl = `http://logs.tf/${logID}#${steamId}`;

    const preview = await fetch(
      `${Deno.env.get("PREVIEW_URL")!}/v0/logstf`,
      {
        method: "POST",
        body: JSON.stringify({ url: logsUrl }),
      },
    );

    const arrayBuffer = await preview.arrayBuffer();

    const att = new AttachmentBuilder(Buffer.from(arrayBuffer), {
      name: "log.webp",
    });

    const embed = new EmbedBuilder({
      color: PayloadColors.Command,
      title: args.t(LanguageKeys.Auto.Logs.EmbedTitle),
      url: logsUrl,
      image: { url: "attachment://log.webp" },
      timestamp: new Date(),
    });

    await send(msg, {
      embeds: [embed],
      files: [att],
    });
  }
}
