import { AutoCommand } from "#lib/structs/AutoResponse/AutoResponse.ts";
import PayloadColors from "#utils/colors.ts";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import { BucketScope } from "@sapphire/framework";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";
import { Buffer } from "node:buffer";
import { renderCounter } from "#lib/metrics.ts";
import { fetchT } from "@sapphire/plugin-i18next";

export default class UserAutoCommand extends AutoCommand {
  public constructor(context: AutoCommand.LoaderContext, options: AutoCommand.Options) {
    super(context, {
      ...options,
      description: LanguageKeys.Auto.Logs.Description,
      cooldownDelay: 2500,
      cooldownScope: BucketScope.Guild,
      cooldownLimit: 1,
      regex: /http(s|):\/\/(www\.|)logs\.tf\/\d+/,
    });
  }

  // @ts-ignore have to do this
  async messageRun(msg: Message, args: AutoCommand.Args, { matched }: AutoCommand.Context) {
    const t = await fetchT(msg);

    renderCounter.inc({ source: "message" });

    const credentials = btoa(`${process.env.BASIC_AUTH_USERNAME}:${process.env.BASIC_AUTH_PASSWORD}`);
    const preview = await fetch(
      `${process.env["PREVIEW_URL"]!}/v1/logstf?url=${matched}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${credentials}`,
        },
      },
    );

    const arrayBuffer = await preview.arrayBuffer();

    const att = new AttachmentBuilder(Buffer.from(arrayBuffer), { name: "log.webp" });

    const embed = new EmbedBuilder({
      color: PayloadColors.Command,
      title: t(LanguageKeys.Auto.Logs.EmbedTitle),
      url: matched,
      image: { url: "attachment://log.webp" },
      footer: {
        text: t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
      },
      timestamp: new Date(),
    });

    await send(msg, { embeds: [embed], files: [att] });
  }
}
