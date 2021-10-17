import {
  AutoCommand,
  AutoCommandOptions,
} from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { captureSelector } from "#utils/screenshot";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";

@ApplyOptions<AutoCommandOptions>({
  regex: /www\.ugcleague\.com\/team_page\.cfm\?clan_id=\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  async run(msg: Message) {
    const url = this.getMatch(msg);

    // Needed hight and width to not have wierdo mobile views
    const screenshotBuffer = await captureSelector(
      `https://${url}`,
      "#wrapper > section.container > div > div.col-md-9 > div:nth-child(3) > div.col-md-8 > div:nth-child(1)",
      {
        defaultViewport: {
          height: 925,
          width: 1000,
        },
      }
    );

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
