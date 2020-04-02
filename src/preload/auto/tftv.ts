import { Client } from "../../lib/types/Client";
import { Message, MessageEmbed } from "discord.js";
import { AutoResponse } from "../../lib/exec/Autoresponse";
import got from "got";

export default class TFTV extends AutoResponse {

    constructor() {
        super(
            "tftv",
            "Created thread previews for TFTV threads.",
            /teamfortress\.tv\/\d+\/[\w-]+/,
            ["SEND_MESSAGES", "EMBED_LINKS"]
        )
    }

    async run(client: Client, msg: Message): Promise<void> {
        const url = "https://" + this.matchMsg(msg);
        const resp = await got(url);
        const $ = cheerio.load(resp.body);

        const frags = $("#thread-frag-count").text().trim();
        const title = $(".thread-header-title").text().trim();
        const $post = $("#thread-container > .post:first-child");
        const author = $post.find(".post-header .post-author").text().trim();
        const body = htmlToText.fromString($post.find(".post-body").html() as string, {
            ignoreImage: true
        });
        const date = $post.find(".post-footer .js-date-toggle").attr("title").replace(/at (\d+:\d+).+$/, "$1");

        let embed = new MessageEmbed();
        embed.setTitle(title);
        embed.setDescription(author);
        embed.addField(url, (body.length > 400 ? body.slice(0, 400) + "..." : body) + "\n[read more](" + url + ")");
        embed.setFooter(`${frags} frags`);
        embed.setTimestamp(new Date(date));
        embed.setColor("#50759D");

        msg.channel.send(embed);
    }
}