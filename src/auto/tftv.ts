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

    if (needFindChild) {
      // is a specific post
    }

    const $post = $(`#thread-container > .post:nth-child(1)`);

    const frags = $("#thread-frag-count").text().trim();
    const author = $post.find(".post-header .post-author").text().trim();
    const body = convert($post.find(".post-body-hidden") as unknown as string);

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
