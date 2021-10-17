import {
  AutoCommand,
  AutoCommandOptions,
} from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { capturePage } from "#utils/screenshot";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";

@ApplyOptions<AutoCommandOptions>({
  regex: /etf2l.org\/matches\/\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  async run(msg: Message) {
    const url = this.getMatch(msg);

    const screenshotBuffer = await capturePage(`https://${url}`, {
      top: {
        selector: "#content > div",
        edge: "top",
      },
      left: {
        selector: "#content",
        edge: "left",
      },
      right: {
        selector: "#content",
        edge: "right",
      },
      bottom: {
        selector: "#content > div > br",
        edge: "bottom",
      },
    });

    const att = new MessageAttachment(screenshotBuffer, "match.png");
    const embed = new MessageEmbed();
    embed.setColor(PayloadColors.COMMAND);
    embed.setTitle("ETF2L Match Preview");
    embed.setURL(`https://${url}`);
    embed.setImage(`attachment://match.png`);
    embed.setFooter(`Rendered by autoresponse ${this.name}`);
    embed.setTimestamp(new Date());

    msg.channel.send({ embeds: [embed], files: [att] });
  }
}
