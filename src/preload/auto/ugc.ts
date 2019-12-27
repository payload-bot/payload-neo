import { Client } from "../../lib/types/Client";
import { Message } from "discord.js";
import { captureSelector, capture } from "../../util/screenshot";

export const name = "ugc";
export const description = "UGC Team Previews";
export const pattern = /www\.ugcleague\.com\/team_page\.cfm\?clan_id=\d+/;
export const permissions = ["SEND_MESSAGES", "ATTACH_FILES"];
export const zones = ["text", "dm"];

export async function run(client: Client, msg: Message) {
    const url = matchMsg(msg);

    let screenshotBuffer = await captureSelector("http://" + url, "div.col-md-8> div");

    msg.channel.send({
        files: [screenshotBuffer]
    });
}

function matchMsg(msg: Message) {
    let match = msg.content.match(pattern) as RegExpMatchArray;

    return match[0];
}