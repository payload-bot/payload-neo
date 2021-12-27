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
import type { Args } from "@sapphire/framework";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Tftv.Description,
  regex:
    /(?<base>teamfortress\.tv\/\d+\/[\w-]+)(?<page>\/\?page=\d)?(?<post>#\d+)*/,
})
export default class UserAutoCommand extends AutoCommand {
  async messageRun(msg: Message, { t }: Args) {
    const match = this.getMatch(msg);
    const allMatches = msg.content.match(this.regex)!;

    const baseUrl = allMatches.groups!.base;

    let page = parseInt(
      allMatches.groups!.page?.replace("/?page=", "") ?? 0,
      10
    );

    let post = parseInt(allMatches.groups!.post?.replace("#", ""), 10);

    if (!page && post > 30) {
      page = Math.floor(post / 30) + 1;
    }

    const url = `https://${baseUrl}${
      page > 0 ? `/?page=${page}#${post}` : `#${post}`
    }`;

    const { data } = (await axios(url, {
      responseType: "text",
    })) as AxiosResponse<string>;

    const $ = cheerio.load(data);

    const title = $(".thread-header-title").text().trim();

    const needFindChild = !!match.split("#")?.[1] ?? false;

    let $post = $(`#thread-container > .post:nth-child(1)`);

    let frags = $("#thread-frag-count").text().trim();
    let body = convert($post.find(".post-body-hidden") as unknown as string);
    let author = $post.find(".post-header .post-author").text().trim();

    if (needFindChild) {
      const postNumber = match.split("#")[1];
      $post = $(`#thread-container > .post > a#${postNumber}`).parent();

      if (!$post.children().length && page > 1) {
        console.log("hello?");
        return await msg.channel.send(
          t(LanguageKeys.Auto.Tftv.NoPostFound, { post: url })
        );
      }

      if (!$post.children().length) {
        $post = $(`#thread-container > .post:last-child`);
      }

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
