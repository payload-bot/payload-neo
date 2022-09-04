import { AutoCommand, AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { capturePage } from "#utils/screenshot";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import config from "#root/config";
import type { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { BucketScope, CommandContext } from "@sapphire/framework";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Logs.Description,
  cooldownDelay: 2500,
  cooldownScope: BucketScope.Guild,
  cooldownLimit: 1,
  regex: /http(s|):\/\/(www\.|)logs\.tf\/\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args, context: CommandContext) {
    const url = context.prefix;

    const screenshotBuffer = await capturePage(url.toString(), {
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
    embed.setURL(url.toString());
    embed.setImage(`attachment://log.webp`);
    embed.setFooter({
      text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
    });
    embed.setTimestamp(new Date());

    return await msg.channel.send({ embeds: [embed], files: [att] });
  }
}
