import { AutoCommand, AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse.js";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { captureSelector } from "#utils/screenshot";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { BucketScope, CommandContext } from "@sapphire/framework";
import type { PayloadCommand } from "#lib/structs/commands/PayloadCommand";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.UGC.Description,
  cooldownDelay: 2500,
  cooldownScope: BucketScope.Guild,
  cooldownLimit: 1,
  regex: /www\.ugcleague\.com\/team_page\.cfm\?clan_id=\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args, context: CommandContext) {
    const url = context.prefix;

    // Needed hight and width to not have wierdo mobile views
    const screenshotBuffer = await captureSelector(
      `https://${url}`,
      "#wrapper > section.container > div > div.col-md-9 > div:nth-child(3) > div.col-md-9 > div:nth-child(1)",
      {
        defaultViewport: {
          height: 1920,
          width: 1080,
        },
      }
    );

    const att = new MessageAttachment(screenshotBuffer, "preview.png");
    const embed = new MessageEmbed();

    embed.setColor(PayloadColors.Command);
    embed.setTitle(args.t(LanguageKeys.Auto.UGC.EmbedTitle));
    embed.setURL(`https://${url}`);
    embed.setImage(`attachment://preview.png`);
    embed.setFooter({
      text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
    });
    embed.setTimestamp(new Date());

    return await msg.channel.send({ embeds: [embed], files: [att] });
  }
}
