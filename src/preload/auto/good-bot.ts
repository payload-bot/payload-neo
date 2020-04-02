import { Client } from "../../lib/types/Client";
import { Message } from "discord.js";
import { AutoResponse } from "../../lib/exec/Autoresponse";

export default class GoodBot extends AutoResponse {

    constructor() {
        super(
            "good bot",
            "Responds to your appreciation sometimes :).",
            /^good bot$/
        )
    }

    async run(client: Client, msg: Message): Promise<void> {
        let lastMessages = await msg.channel.messages.fetch({ limit: 5 });
        let lastBotMessage = lastMessages.find((message => message.author.id == client.user.id));

        if (!lastBotMessage) return;

        if (Date.now() - lastBotMessage.createdTimestamp > 1000 * 60) return;

        if (Math.random() < 0.8751) return;

        msg.channel.send("<:heart_eyes:>");
    }
}