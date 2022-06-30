import type { CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { Translate as GTranslate } from "@google-cloud/translate/build/src/v2/index";
import { send } from "@sapphire/plugin-editable-commands";
import PayloadColors from "#utils/colors";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Translate.Description,
  detailedDescription: LanguageKeys.Commands.Translate.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: PayloadCommand.Args) {
    const phrase = await args.rest("string").catch(() => null);

    if (!phrase) {
      return await send(msg, args.t(LanguageKeys.Commands.Translate.NoPhrase));
    }

    const translator = new GTranslate({
      projectId: process.env.GCP_ID,
      keyFilename: process.env.GOOGLE_CREDENTIALS_PATH,
    });

    try {
      const [botchedPhrase] = await translator.translate(phrase, "en");

      const embed = new MessageEmbed({
        description: botchedPhrase,
        title: args.t(LanguageKeys.Commands.Translate.EmbedTitle),
        author: {
          name: msg.author.username,
          iconURL: msg.author.displayAvatarURL(),
        },
        footer: {
          text: args.t(LanguageKeys.Commands.Translate.EmbedFooter),
        },
        color: PayloadColors.User,
      });

      return await send(msg, { embeds: [embed] });
    } catch (err) {
      return await send(msg, args.t(LanguageKeys.Commands.Translate.ErrorTranslating));
    }
  }
}
