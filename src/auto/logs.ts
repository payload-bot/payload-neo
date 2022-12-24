import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { capturePage } from "#utils/screenshot";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import config from "#root/config";
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
  // @ts-ignore
  async messageRun(msg: Message, args: AutoCommand.Args, { matched }: AutoCommand.Context) {
    const screenshotBuffer = await capturePage(matched, {
      top: {
        selector: "#log-header",
        edge: "top",
      },
      left: {
        selector: "#log-header",
        edge: "left",
      },
      right: {
        selector: "#log-header",
        edge: "right",
      },
      bottom: {
        selector: "#log-section-players",
        edge: "bottom",
      },

      cssPath: config.files.LOGS_CSS,
    });

    const att = new MessageAttachment(screenshotBuffer, "log.webp");
    const embed = new MessageEmbed();

    embed.setColor(PayloadColors.Command);
    embed.setTitle(args.t(LanguageKeys.Auto.Logs.EmbedTitle));
    embed.setURL(matched);
    embed.setImage(`attachment://log.webp`);
    embed.setFooter({
      text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
    });
    embed.setTimestamp(new Date());

    await send(msg, { embeds: [embed], files: [att] });
  }
}
