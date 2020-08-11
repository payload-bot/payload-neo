import { Command } from "../../../lib/exec/Command";
import { Client} from "../../../lib/types";
import { Message } from "discord.js";
import { random } from "../../../util/random";
import Language from "../../../lib/types/Language";

export default class EightBall extends Command {
    responses: Array<string>;

    constructor() {
        super(
            "8ball",
            "Asks the 8ball a question",
            [
                {
                    name: "question",
                    description: "The question to ask the 8ball.",
                    required: true,
                    type: "string"
                }
            ]
        );

        this.responses = [
            "It is certain.",
            "It is decidedly so.",
            "Without a doubt.",
            "Yes - definitely.",
            "You may rely on it.",
            "As I see it, yes.",
            "Most likely.",
            "Outlook good.",
            "Yes.",
            "Signs point to yes.",

            "Reply hazy, try again.",
            "Ask again later.",
            "Better not tell you now.",
            'Cannot predict now.',
            "Concentrate and ask again.",

            "Don't count on it.",
            "My reply is no.",
            "My sources say no.",
            "Outlook not so good.",
            "Very doubtful."
        ];
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const question = (await this.getArgs(msg)).join(" ");
        const lang: Language = await this.getLanguage(msg) as any

        if (!question) return await this.fail(msg, lang.eightball_noquestion);
        
        await this.respond(msg, lang.eightball_answer.replace('%answer', this.responses[random(0, this.responses.length - 1)]));

        return true;
    }
}