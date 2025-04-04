import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { Message, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Etf2l.Etf2lMatchesDescription,
  regex: /etf2l.org\/matches\/\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  // @ts-ignore
  async messageRun(msg: Message, args: AutoCommand.Args, { matched }: AutoCommand.Context) {
    // const screenshotBuffer = await capturePage(`https://${matched}`, {
    //   top: {
    //     selector: "#content > div",
    //     edge: "top",
    //   },
    //   left: {
    //     selector: "#content",
    //     edge: "left",
    //   },
    //   right: {
    //     selector: "#content",
    //     edge: "right",
    //   },
    //   bottom: {
    //     selector: "#content > div > br",
    //     edge: "bottom",
    //   },
    // });

    // const att = new AttachmentBuilder(Buffer.from(screenshotBuffer), { name: "match.png" });

    // const embed = new EmbedBuilder({
    //   color: PayloadColors.Command,
    //   title: args.t(LanguageKeys.Auto.Etf2l.Etf2lMatchesEmbedTitle),
    //   url: `https://${matched}`,
    //   image: { url: "attachment://match.png" },
    //   footer: {
    //     text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
    //   },
    //   timestamp: new Date(),
    // });

    // await send(msg, { embeds: [embed], files: [att] });
  }
}
