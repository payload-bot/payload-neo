import { Client } from "../../lib/types";
import { Message, RichEmbed } from "discord.js";
import got from "got";
import htmlToText from "html-to-text";
import cheerio from "cheerio";

export const name = "hltf";
export const description = "Creates thread previews for highlander.tf threads.";
export const pattern = /forums\.highlander.tf\/thread\-\d+/;
export const permissions = ["SEND_MESSAGES", "EMBED_LINKS"];
export const zones = ["text", "dm"];

export async function run(client: Client, msg: Message) {
    const url = "https://" + matchMsg(msg) + ".html";
    const resp = await got(url);
    const $ = cheerio.load(resp.body);

    const title = $("#content > div > table > tbody > tr:nth-child(1) > td > div:nth-child(2) > strong").text().trim();
    const $post = $("#posts_container > #posts > .post:first-of-type");
    const author = $post.find(".post_author > .author_information > strong > .largetext > a > span").text().trim();
    const body = htmlToText.fromString($post.find(".post_content > .post_body").html() as string, {
        ignoreImage: true
    });

    let embed = new RichEmbed();
        embed.setTitle(title);
        embed.setDescription(author);
        embed.addField(url, (body.length > 400 ? body.slice(0, 400) + "..." : body) + "\n[read more](" + url+ ")");
        embed.setColor("#e29455");

    msg.channel.send(embed);
}

function matchMsg(msg: Message) {
    let match = msg.content.match(pattern) as RegExpMatchArray;

    return match[0];
}