import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, MessageEmbed } from "discord.js";
import { Translate as GTranslate } from "@google-cloud/translate/build/src/v2/index"
import config from "../../../config";
import colors from "../../../lib/misc/colors";

export default class Translate extends Command {
    constructor() {
        super(
            "translate",
            "Breaks a phrase in translation.",
            [
                {
                    name: "phrase",
                    description: "The phrase to translate.",
                    required: true,
                    type: "string",
                    minLength: 3,
                    maxLength: 100
                }
            ]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.parseArgs(msg);
        const lang = await this.getLanguage(msg);

        if (args === false) {
            return false;
        }

        const phrase = msg.toString().substr(13).trim();

        const translator = new GTranslate({
            projectId: config.GCP_ID,
            keyFilename: config.GOOGLE_CREDENTIALS_PATH
        }
        );

        try {
            const [botchedPhrase] = await translator.translate(phrase, "en");

            let embed = new MessageEmbed()
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL());
            embed.setColor(colors.blue);
            embed.setDescription(lang.translate_embeddesc.replace('%translated', botchedPhrase));
            embed.setTitle(lang.translate_embedtitle);
            embed.setFooter(lang.translate_embedfooter)

            await msg.channel.send(embed)
            return true;
        } catch (err) {
            return await this.fail(msg, lang.translate_error);
        }
    }
}