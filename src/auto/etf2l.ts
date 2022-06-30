import { AutoCommand, AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { captureSelector } from "#utils/screenshot";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import type { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { BucketScope, CommandContext } from "@sapphire/framework";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Etf2l.Etf2lDescription,
  cooldownDelay: 2500,
  cooldownScope: BucketScope.Guild,
  cooldownLimit: 1,
  regex: /etf2l.org\/teams\/\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args, { prefix: url }: CommandContext) {
    const screenshotBuffer = await captureSelector(`https://${url}`, "#content > div > div > table.pls");

    const att = new MessageAttachment(screenshotBuffer, "team.png");

    const embed = new MessageEmbed();
    embed.setColor(PayloadColors.Command);
    embed.setTitle(args.t(LanguageKeys.Auto.Etf2l.Etf2lEmbedTitle));
    embed.setURL(`https://${url}`);
    embed.setImage(`attachment://team.png`);
    embed.setFooter({
      text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
    });
    embed.setTimestamp(new Date());

    return await msg.channel.send({ embeds: [embed], files: [att] });
  }
}
