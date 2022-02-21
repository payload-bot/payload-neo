import {
  AutoCommand,
  AutoCommandOptions,
} from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { capturePage } from "#utils/screenshot";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import type { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import type { CommandContext } from "@sapphire/framework";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Etf2l.Etf2lMatchesDescription,
  regex: /etf2l.org\/matches\/\d+/,
})
export default class UserAutoCommand extends AutoCommand {
  async messageRun(
    msg: Message,
    args: PayloadCommand.Args,
    context: CommandContext
  ) {
    const url = context.prefix;

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
    embed.setTitle(args.t(LanguageKeys.Auto.Etf2l.Etf2lMatchesEmbedTitle));
    embed.setURL(`https://${url}`);
    embed.setImage(`attachment://match.png`);
    embed.setFooter({
      text: args.t(LanguageKeys.Globals.AutoEmbedFooter, { name: this.name }),
    });
    embed.setTimestamp(new Date());

    return await msg.channel.send({ embeds: [embed], files: [att] });
  }
}
