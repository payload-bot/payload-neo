import { Client } from "../../lib/types/Client";
import { Message, MessageEmbed } from "discord.js";
import { AutoResponse } from "../../lib/exec/Autoresponse";
import htmlToText from "html-to-text";
import cheerio from "cheerio";
import got from "got";

export default class HLTF extends AutoResponse {

    constructor() {
        super(
            "hltf",
            "Creates thread previews for highlander.tf threads.",
            /forums\.highlander.tf\/thread\-\d+/,
            ["SEND_MESSAGES", "EMBED_LINKS"]
        )
    }

    async run(client: Client, msg: Message): Promise<void> {
        const url = "https://" + this.matchMsg(msg) + ".html";
        const resp = await got(url);
        const $ = cheerio.load(resp.body);

        const title = $("#content > div > table > tbody > tr:nth-child(1) > td > div:nth-child(2) > strong").text().trim();
        const $post = $("#posts_container > #posts > .post:first-of-type");
        const author = $post.find(".post_author > .author_information > strong > .largetext > a > span").text().trim();
        const body = htmlToText.fromString($post.find(".post_content > .post_body").html() as string, {
            ignoreImage: true
        });

        let embed = new MessageEmbed();
        embed.setTitle(title);
        embed.setDescription(author);
        embed.addField(url, (body.length > 400 ? body.slice(0, 400) + "..." : body) + "\n[read more](" + url + ")");
        embed.setColor("#e29455");

        msg.channel.send(embed);
    }
}