import { AutoCommand } from "#lib/structs/AutoResponse/AutoResponse.ts";
import PayloadColors from "#utils/colors.ts";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";
import { Buffer } from "node:buffer";
import { fetchT } from "@sapphire/plugin-i18next";

export default class UserAutoCommand extends AutoCommand {
  public constructor(context: AutoCommand.LoaderContext, options: AutoCommand.Options) {
    super(context, {
      ...options,
      description: LanguageKeys.Auto.Etf2l.Etf2lMatchesDescription,
      regex: /etf2l.org\/matches\/\d+/,
    });
  }

  async run(msg: Message, { matched }: AutoCommand.LoaderContext) {
    const t = await fetchT(msg);

    const credentials = btoa(
      `${process.env.BASIC_AUTH_USERNAME}:${process.env.BASIC_AUTH_PASSWORD}`,
    );
    const preview = await fetch(`${process.env["PREVIEW_URL"]!}/v1/etf2l/matches?url=${matched}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    const arrayBuffer = await preview.arrayBuffer();

    const att = new AttachmentBuilder(Buffer.from(arrayBuffer), {
      name: "match.png",
    });

    const embed = new EmbedBuilder({
      color: PayloadColors.Command,
      title: t(LanguageKeys.Auto.Etf2l.Etf2lMatchesEmbedTitle),
      url: `https://${matched}`,
      image: { url: "attachment://match.png" },
      footer: {
        text: t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
      },
      timestamp: new Date(),
    });

    await send(msg, { embeds: [embed], files: [att] });
  }
}
