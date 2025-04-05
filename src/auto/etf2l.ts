import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors.ts";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { BucketScope } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Etf2l.Etf2lDescription,
  cooldownDelay: 2500,
  cooldownScope: BucketScope.Guild,
  cooldownLimit: 1,
  regex: /etf2l.org\/teams\/\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  // @ts-ignore have to do this
  async messageRun(msg: Message, args: AutoCommand.Args, { matched }: AutoCommand.Context) {
    // const screenshotBuffer = await captureSelector(`https://${matched}`, "#content > div > div > table.pls");

    // const att = new AttachmentBuilder(Buffer.from(screenshotBuffer), { name: "team.png" });

    // const embed = new EmbedBuilder({
    //   color: PayloadColors.Command,
    //   title: args.t(LanguageKeys.Auto.Etf2l.Etf2lEmbedTitle),
    //   url: `https://${matched}`,
    //   image: { url: "attachment://team.png" },
    //   footer: {
    //     text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
    //   },
    //   timestamp: new Date(),
    // });

    // await send(msg, { embeds: [embed], files: [att] });
  }
}
