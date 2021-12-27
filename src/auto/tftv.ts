import {
  AutoCommand,
  AutoCommandOptions,
} from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors";
import { Message, MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";
import cheerio from "cheerio";
import { convert } from "html-to-text";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Tftv.Description,
  regex: /teamfortress\.tv\/\d+\/[\w-]+(#\d+)*/,
})
export default class UserAutoCommand extends AutoCommand {
  async messageRun(msg: Message) {
    const match = this.getMatch(msg);

    const url = "https://" + match;
    const { data } = (await axios(url, {
      responseType: "text",
    })) as AxiosResponse<string>;
    const $ = cheerio.load(data);

    const title = $(".thread-header-title").text().trim();

    const needFindChild = match.split("#")[1].length > 0;

    let $post = $(`#thread-container > .post:nth-child(1)`);
    let frags = $("#thread-frag-count").text().trim();
    let body = convert($post.find(".post-body-hidden") as unknown as string);
    let author = $post.find(".post-header .post-author").text().trim();

    if (needFindChild) {
      $post = $(`#thread-container > .post:nth-child(${match.split("#")[1]})`);
      frags = $post.find(`.post-frag-count`).text().trim();
      body = convert($post.find(".post-body-hidden") as unknown as string);
      author = $post.find(".post-header .post-author").text().trim();
    }

    const dateSelector = $post
      .find(".post-footer .js-date-toggle")
      .attr("title");

    const date = dateSelector
      ? dateSelector.replace(/at (\d+:\d+).+$/, "$1")
      : "N/A";

    const embed = new MessageEmbed({
      title,
      url,
      color: PayloadColors.USER,
      timestamp: new Date(date),
      description: `${author}\n\n${
        body.length > 700
          ? `${body.slice(0, 700)}...\n[read more](${url})`
          : body
      }`,
      footer: {
        text: `${frags} frags`,
      },
    });

    return await send(msg, { embeds: [embed] });
  }
}
