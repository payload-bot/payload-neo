import type { Args, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed } from "discord.js";
import { Translate as GTranslate } from "@google-cloud/translate/build/src/v2/index";
import { send } from "@sapphire/plugin-editable-commands";
import PayloadColors from "#utils/colors";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";

@ApplyOptions<CommandOptions>({
  description: "Breaks a phrase in translation.",
})
export class UserCommand extends PayloadCommand {
  async messageRun(msg: Message, args: Args) {
    const phrase = await args.rest("string").catch(() => null);

    if (!phrase) {
      return await send(msg, "no phrase sent");
    }

    const translator = new GTranslate({
      projectId: process.env.GCP_ID,
      keyFilename: process.env.GOOGLE_CREDENTIALS_PATH,
    });

    try {
      const [botchedPhrase] = await translator.translate(phrase, "en");

      const embed = new MessageEmbed({
        description: botchedPhrase,
        title: "Translate Result",
        author: {
          name: msg.author.username,
          iconURL: msg.author.displayAvatarURL(),
        },
        footer: {
          text: "Translated by Google Translate",
        },
        color: PayloadColors.USER,
      });

      return await send(msg, { embeds: [embed] });
    } catch (err) {
      return await send(msg, "error translating");
    }
  }
}
