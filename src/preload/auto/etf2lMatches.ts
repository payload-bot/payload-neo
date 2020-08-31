import { Client } from "../../lib/types/Client";
import { Message } from "discord.js";
import { capture } from "../../util/screenshot";
import { AutoResponse } from "../../lib/exec/Autoresponse";

export default class ETF2LMatchPreviews extends AutoResponse {

    constructor() {
        super(
            "etf2l-match-previews",
            "Runs ETF2L match previews",
            /etf2l.org\/matches\/\d+/,
            ["SEND_MESSAGES", "EMBED_LINKS"]
        )
    }

    async run(client: Client, msg: Message): Promise<void> {
        const url = this.matchMsg(msg);

        const screenshotBuffer = await capture("http://" + url, {
            top: {
                selector: "#content > div",
                edge: "top"
            },
            left: {
                selector: "#content",
                edge: "left"
            },
            right: {
                selector: "#content",
                edge: "right"
            },
            bottom: {
                selector: "#content > div > br",
                edge: "bottom"
            },
        });

        msg.channel.send({
            files: [screenshotBuffer]
        });
    }
}