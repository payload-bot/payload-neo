import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { captureSelector } from "#utils/screenshot";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { BucketScope } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.UGC.Description,
  cooldownDelay: 2500,
  cooldownScope: BucketScope.Guild,
  cooldownLimit: 1,
  regex: /www\.ugcleague\.com\/team_page\.cfm\?clan_id=\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  // @ts-ignore
  async messageRun(msg: Message, args: AutoCommand.Args, { matched }: AutoCommand.Context) {
    // Needed hight and width to not have wierdo mobile views
    const screenshotBuffer = await captureSelector(
      `https://${matched}`,
      "#wrapper > section.container > div > div.col-md-9 > div:nth-child(3) > div.col-md-9 > div:nth-child(1)",
      {
        defaultViewport: {
          height: 1920,
          width: 1080,
        },
      },
    );

    const att = new AttachmentBuilder(screenshotBuffer, { name: "team.png" });

    const embed = new EmbedBuilder({
      color: PayloadColors.Command,
      title: args.t(LanguageKeys.Auto.UGC.EmbedTitle),
      url: `https://${matched}`,
      image: { url: "attachment://team.png" },
      footer: {
        text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
      },
      timestamp: new Date(),
    });

    await send(msg, { embeds: [embed], files: [att] });
  }
}
