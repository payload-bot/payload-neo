import {
  AutoCommand,
  AutoCommandOptions,
} from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { captureSelector } from "#utils/screenshot";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import type { TFunction } from "@sapphire/plugin-i18next";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Etf2l.Description,
  regex: /etf2l.org\/teams\/\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  async messageRun(msg: Message, t: TFunction) {
    const url = this.getMatch(msg);

    const screenshotBuffer = await captureSelector(
      `https://${url}`,
      "#content > div > div > table.pls"
    );

    const att = new MessageAttachment(screenshotBuffer, "team.png");

    const embed = new MessageEmbed();
    embed.setColor(PayloadColors.COMMAND);
    embed.setTitle(t(LanguageKeys.Auto.Etf2l.EmbedTitle));
    embed.setURL(`https://${url}`);
    embed.setImage(`attachment://team.png`);
    embed.setFooter(t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }));
    embed.setTimestamp(new Date());

    return await msg.channel.send({ embeds: [embed], files: [att] });
  }
}
