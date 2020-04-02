import { Client } from "../../lib/types/Client";
import { Message } from "discord.js";
import { AutoResponse } from "../../lib/exec/Autoresponse";
import { captureSelector } from "../../util/screenshot";

export default class UGC extends AutoResponse {

    constructor() {
        super(
            "ugc",
            "UGC Team Previews.",
            /www\.ugcleague\.com\/team_page\.cfm\?clan_id=\d+/,
            ["SEND_MESSAGES", "ATTACH_FILES"]
        )
    }

    async run(client: Client, msg: Message): Promise<void> {
        const url =this.matchMsg(msg);

        let screenshotBuffer = await captureSelector("http://" + url, "div.col-md-8");

        msg.channel.send({
            files: [screenshotBuffer]
        });
    }
}