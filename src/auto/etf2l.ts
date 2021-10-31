import {
  AutoCommand,
  AutoCommandOptions,
} from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { captureSelector } from "#utils/screenshot";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";

@ApplyOptions<AutoCommandOptions>({
  regex: /etf2l.org\/teams\/\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  async messageRun(msg: Message) {
    const url = this.getMatch(msg);

    const screenshotBuffer = await captureSelector(
      `https://${url}`,
      "#content > div > div > table.pls"
    );

    const att = new MessageAttachment(screenshotBuffer, "team.png");

    const embed = new MessageEmbed();
    embed.setColor(PayloadColors.COMMAND);
    embed.setTitle("ETF2L Team Preview");
    embed.setURL(`https://${url}`);
    embed.setImage(`attachment://team.png`);
    embed.setFooter(`Rendered by autoresponse ${this.name}`);
    embed.setTimestamp(new Date());

    msg.channel.send({ embeds: [embed], files: [att] });
  }
}
