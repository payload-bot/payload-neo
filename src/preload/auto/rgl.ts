import { Client } from "../../lib/types/Client";
import { Message } from "discord.js";
import { AutoResponse } from "../../lib/exec/Autoresponse";
import { captureSelector } from "../../util/screenshot";

export default class RGL extends AutoResponse {

    constructor() {
        super(
            "rgl",
            "Generates RGL team previews.",
            /rgl\.gg\/Public\/Team\.aspx\?t=\d+\&r=\d+/,
            ["SEND_MESSAGES", "ATTACH_FILES"]
        )
    }

    async run(client: Client, msg: Message): Promise<void> {
        const url = this.matchMsg(msg);

        let screenshotBuffer = await captureSelector(`https://${url}`, "div.col-md-12.col-lg-5")

        msg.channel.send({
            files: [screenshotBuffer]
        });
    }
}