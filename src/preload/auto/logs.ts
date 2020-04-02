import { Client } from "../../lib/types/Client";
import { Message } from "discord.js";
import { AutoResponse } from "../../lib/exec/Autoresponse";
import { render } from "../../util/render-log";

export default class Logs extends AutoResponse {

    constructor() {
        super(
            "logs",
            "Automatically renders logs whenever a logs link is posted.",
            /http(s|):\/\/(www\.|)logs\.tf\/\d+/,
            ["SEND_MESSAGES", "ATTACH_FILES"]
        )
    }

    async run(client: Client, msg: Message): Promise<void> {
        let link = this.matchMsg(msg);

        let screenshotBuffer = await render(link);

        msg.channel.send({
            files: [screenshotBuffer]
        });
    }
}