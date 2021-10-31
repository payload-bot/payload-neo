import {
  AutoCommand,
  AutoCommandOptions,
} from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { capturePage } from "#utils/screenshot";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import config from "#root/config";

@ApplyOptions<AutoCommandOptions>({
  regex: /http(s|):\/\/(www\.|)logs\.tf\/\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  async messageRun(msg: Message) {
    const url = this.getMatch(msg);

    const screenshotBuffer = await capturePage(url, {
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

    const att = new MessageAttachment(screenshotBuffer, "log.png");
    const embed = new MessageEmbed();
    embed.setColor(PayloadColors.COMMAND);
    embed.setTitle("Logs.tf Preview");
    embed.setURL(url);
    embed.setImage(`attachment://log.png`);
    embed.setFooter(`Rendered by autoresponse ${this.name}`);
    embed.setTimestamp(new Date());

    msg.channel.send({ embeds: [embed], files: [att] });
  }
}
