import { Client } from "../../lib/types/Client";
import { Message } from "discord.js";
import { capture } from "../../util/screenshot";

export const name = "rgl";
export const description = "Generates RGL team previews.";
export const pattern = /rgl.gg\/Public\/Team.aspx\?t=\d+\&r=\d+/;
export const permissions = ["SEND_MESSAGES", "ATTACH_FILES"];
export const zones = ["text", "dm"];

export async function run(client: Client, msg: Message) {
    const url = matchMsg(msg);

    let screenshotBuffer = await capture("http://" + url, {
        top: {
            selector: "div.col-md-12.col-lg-5",
            edge: "top"
        },
        right: {
            selector: "div.col-md-12.col-lg-5",
            edge: "right"
        },
        bottom: {
            selector: "div.col-md-12.col-lg-5",
            edge: "bottom"
        },
        left: {
            selector: "div.col-md-12.col-lg-5",
            edge: "left"
        }
    });

    msg.channel.send({
        files: [screenshotBuffer]
    });
}

function matchMsg(msg: Message) {
    let match = msg.content.match(pattern) as RegExpMatchArray;

    return match[0];
}