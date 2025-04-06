import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors.ts";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import { BucketScope } from "@sapphire/framework";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";
import { Buffer } from "node:buffer";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Logs.Description,
  cooldownDelay: 2500,
  cooldownScope: BucketScope.Guild,
  cooldownLimit: 1,
  regex: /http(s|):\/\/(www\.|)logs\.tf\/\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  // @ts-ignore have to do this
  async messageRun(msg: Message, args: AutoCommand.Args, { matched }: AutoCommand.Context) {
    const preview = await fetch(
      `${Deno.env.get("PREVIEW_URL")!}/v0/logstf`,
      {
        method: "POST",
        body: JSON.stringify({ url: matched }),
      },
    );

    const arrayBuffer = await preview.arrayBuffer();

    const att = new AttachmentBuilder(Buffer.from(arrayBuffer), { name: "log.webp" });

    const embed = new EmbedBuilder({
      color: PayloadColors.Command,
      title: args.t(LanguageKeys.Auto.Logs.EmbedTitle),
      url: matched,
      image: { url: "attachment://log.webp" },
      footer: {
        text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
      },
      timestamp: new Date(),
    });

    await send(msg, { embeds: [embed], files: [att] });
  }
}
