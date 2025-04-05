import {
  AutoCommand,
  type AutoCommandOptions,
} from "#lib/structs/AutoResponse/AutoResponse.ts";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors.ts";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";
import { Buffer } from "node:buffer";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Etf2l.Etf2lMatchesDescription,
  regex: /etf2l.org\/matches\/\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  // @ts-ignore have to do this
  async messageRun(
    msg: Message,
    args: AutoCommand.Args,
    { matched }: AutoCommand.Context,
  ) {
    const preview = await fetch(
      `${Deno.env.get("PREVIEW_URL")!}/v0/etf2l/matches`,
      {
        method: "POST",
        body: JSON.stringify({ url: matched }),
      },
    );

    const arrayBuffer = await preview.arrayBuffer();

    const att = new AttachmentBuilder(Buffer.from(arrayBuffer), {
      name: "match.png",
    });

    const embed = new EmbedBuilder({
      color: PayloadColors.Command,
      title: args.t(LanguageKeys.Auto.Etf2l.Etf2lMatchesEmbedTitle),
      url: `https://${matched}`,
      image: { url: "attachment://match.png" },
      footer: {
        text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
      },
      timestamp: new Date(),
    });

    await send(msg, { embeds: [embed], files: [att] });
  }
}
