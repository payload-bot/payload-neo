import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { capturePage } from "#utils/screenshot";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { BucketScope } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.RGL.RGLDescription,
  cooldownDelay: 2500,
  cooldownScope: BucketScope.Guild,
  cooldownLimit: 1,
  regex: /rgl\.gg\/Public\/Team\.aspx\?t=\d+\&r=\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  // @ts-ignore
  async messageRun(msg: Message, args: AutoCommand.Args, { matched }: AutoCommand.Context) {
    const screenshotBuffer = await capturePage(
      `https://${matched}`,
      {
        top: {
          selector: "#ContentPlaceHolder1_pnlMain",
          edge: "top",
        },
        left: {
          selector: "#ContentPlaceHolder1_ContentPlaceHolder1_ContentPlaceHolder1_divTeamInfo > div.col-md-12.col-lg-12.text-center > div:nth-child(2) > div.col-lg-4.col-sm-12",
          edge: "left",
        },
        right: {
          selector: "#ContentPlaceHolder1_ContentPlaceHolder1_ContentPlaceHolder1_divTeamInfo > div.col-md-12.col-lg-12.text-center > div:nth-child(2) > div.col-lg-4.col-sm-12",
          edge: "right",
        },
        bottom: {
          selector:
            "#ContentPlaceHolder1_ContentPlaceHolder1_ContentPlaceHolder1_divTeamInfo > div.col-md-12.col-lg-12.text-center > div:nth-child(2) > div.col-lg-4.col-sm-12",
          edge: "bottom",
        },
      },
      {
        defaultViewport: {
          height: 740,
          width: 1040,
        },
      }
    );

    const att = new MessageAttachment(screenshotBuffer, "team.png");

    const embed = new MessageEmbed();
    embed.setColor(PayloadColors.Command);
    embed.setTitle(args.t(LanguageKeys.Auto.RGL.RGLEmbedTitle));
    embed.setURL(`https://${matched}`);
    embed.setImage(`attachment://team.png`);
    embed.setFooter({
      text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
    });
    embed.setTimestamp(new Date());

    await send(msg, { embeds: [embed], files: [att] });
  }
}
