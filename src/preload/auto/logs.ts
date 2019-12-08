import { Client } from "../../lib/types/Client";
import { Message } from "discord.js";
import { render } from "../../util/render-log";

export const name = "logs";
export const description = "Automatically renders logs whenever a logs link is posted.";
export const pattern = /http(s|):\/\/(www\.|)logs\.tf\/\d+/;
export const permissions = ["SEND_MESSAGES", "ATTACH_FILES"];
export const zones = ["text", "dm"];

export async function run(client: Client, msg: Message) {
    let link = matchMsg(msg);

    let screenshotBuffer = await render(link);
    
    msg.channel.send({
        files: [screenshotBuffer]
    });
}

function matchMsg(msg: Message) {
    let match = msg.content.match(pattern) as RegExpMatchArray;

    return match[0];
}