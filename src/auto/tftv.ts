import {
  AutoCommand,
  AutoCommandOptions,
} from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { Message, MessageEmbed } from "discord.js";
import axios from "axios";
import cheerio from "cheerio";
import { htmlToText } from "html-to-text";

@ApplyOptions<AutoCommandOptions>({
  regex: /teamfortress\.tv\/\d+\/[\w-]+/,
})
export default class UserAutoCommand extends AutoCommand {
  async messageRun(msg: Message) {
    const url = "https://" + this.getMatch(msg);
    const { data } = await axios(url, { responseType: "text" });
    const $ = cheerio.load(data as string);

    const frags = $("#thread-frag-count").text().trim();
    const title = $(".thread-header-title").text().trim();
    const $post = $(`#thread-container > .post:nth-child(1)`);
    const author = $post.find(".post-header .post-author").text().trim();
    const body = htmlToText($post.find(".post-body") as any as string);

    const dateSelector = $post
      .find(".post-footer .js-date-toggle")
      .attr("title");

    const date = dateSelector
      ? dateSelector.replace(/at (\d+:\d+).+$/, "$1")
      : "N/A";

    const embed = new MessageEmbed({
      description: `${author}\n\n${
        body.length > 700
          ? `${body.slice(0, 700)}...\n[read more](${url})`
          : body
      }`,
      footer: {
        text: `${frags} frags`,
      },
      color: PayloadColors.USER,
      timestamp: new Date(date),
      title,
      url,
    });

    msg.channel.send({ embeds: [embed] });
  }
}
