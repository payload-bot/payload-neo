import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";
import { Translate as GTranslate} from "@google-cloud/translate/build/src/v2/index"
import config from "../../../config";

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

        if (args === false) {
            return false;
        }

        const phrase = msg.toString().substr(13);

        const translator = new GTranslate({ 
                projectId: config.GCP_ID,
                keyFilename: config.GOOGLE_CREDENTIALS_PATH
            }
        );

        try {
            const [botchedPhrase] = await translator.translate(phrase, "en");
            await this.respond(msg, botchedPhrase);

            return true;
        } catch (err) {
            return await this.fail(msg, "Error translating.");
        }
    }
}