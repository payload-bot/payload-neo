import { Client } from "../../lib/types/Client";
import { Message } from "discord.js";
import { captureSelector } from "../../util/screenshot";
import { AutoResponse } from "../../lib/exec/Autoresponse";

export default class ETF2L extends AutoResponse {

    constructor() {
        super(
            "etf2l",
            "Runs ETF2L team previews",
            /etf2l.org\/teams\/\d+/,
            ["SEND_MESSAGES", "EMBED_LINKS"]
        )
    }

    async run(client: Client, msg: Message): Promise<void> {
        const url = this.matchMsg(msg);

        let screenshotBuffer = await captureSelector("http://" + url, "#content > div > div > table.pls");

        msg.channel.send({
            files: [screenshotBuffer]
        });
    }
}