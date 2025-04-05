import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors.ts";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import config from "#root/config.ts";
import { BucketScope } from "@sapphire/framework";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";

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
    // const screenshotBuffer = await capturePage(matched, {
    //   top: {
    //     selector: "#log-header",
    //     edge: "top",
    //   },
    //   left: {
    //     selector: "#log-header",
    //     edge: "left",
    //   },
    //   right: {
    //     selector: "#log-header",
    //     edge: "right",
    //   },
    //   bottom: {
    //     selector: "#log-section-players",
    //     edge: "bottom",
    //   },

    //   cssPath: config.files.LOGS_CSS,
    // });

    // const att = new AttachmentBuilder(Buffer.from(screenshotBuffer), { name: "log.webp" });

    // const embed = new EmbedBuilder({
    //   color: PayloadColors.Command,
    //   title: args.t(LanguageKeys.Auto.Logs.EmbedTitle),
    //   url: matched,
    //   image: { url: "attachment://log.webp" },
    //   footer: {
    //     text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
    //   },
    //   timestamp: new Date(),
    // });

    // await send(msg, { embeds: [embed], files: [att] });
  }
}
