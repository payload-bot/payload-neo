import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { ApplyOptions } from "@sapphire/decorators";
import PayloadColors from "#utils/colors.ts";
import { EmbedBuilder, Message } from "discord.js";
import { load } from "cheerio";
import { htmlToText } from "html-to-text";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";
import { fetch, FetchResultTypes } from "@sapphire/fetch";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Tftv.Description,
  regex: /(?<base>teamfortress\.tv\/\d+\/[\w-]+)(?<page>\/\?page=\d)?(?<post>#\d+)*/,
})
export default class UserAutoCommand extends AutoCommand {
  override async messageRun(msg: Message, { t }: AutoCommand.Args) {
    const match = this.getMatch(msg);
    const allMatches = msg.content.match(this.regex)!;

    const baseUrl = allMatches.groups!.base;

    let page = parseInt(allMatches.groups!.page?.replace("/?page=", "") ?? "0", 10);

    const post = parseInt(allMatches.groups!.post?.replace("#", ""), 10);

    if (!page && post > 30) {
      page = Math.floor(post / 30) + 1;
    }

    const url = `https://${baseUrl}${page > 0 ? `/?page=${page}#${post}` : `#${post}`}`;

    const data = await fetch(url, FetchResultTypes.Text);

    const $ = load(data);

    const title = $(".thread-header-title").text().trim();

    const needFindChild = !!match.split("#")?.[1];

    let $post = $(`#thread-container > .post:nth-child(1)`);

    let frags = $("#thread-frag-count").text().trim();
    const htmlBody = $post.find(".post-body");

    const anchorRules = {
      selectors: [
        {
          selector: "a",
          options: { hideLinkHrefIfSameAsText: true },
        },
      ],
    };

    let body = htmlToText(htmlBody.html()!, anchorRules);

    let author = $post.find(".post-header .post-author").text().trim();

    if (needFindChild) {
      const postNumber = match.split("#")[1];
      $post = $(`#thread-container > .post > a#${postNumber}`).parent();

      if (!$post.children().length && page > 1) {
        await send(msg, t(LanguageKeys.Auto.Tftv.NoPostFound, { post: url }));
      }

      if (!$post.children().length) {
        $post = $(`#thread-container > .post:last-child`);
      }

      frags = $post.find(`.post-frag-count`).text().trim();
      const postBody = $post.find(".post-body");
      body = htmlToText(postBody.html()!, anchorRules);
      author = $post.find(".post-header .post-author").text().trim();
    }

    const dateSelector = $post.find(".post-footer .js-date-toggle").attr("title");
    const date = dateSelector ? dateSelector.replace(/at (\d+:\d+).+$/, "$1") : "N/A";

    const embed = new EmbedBuilder({
      title,
      url,
      color: PayloadColors.User,
      timestamp: new Date(date),
      description: `${author}\n\n${body.length > 700 ? `${body.slice(0, 700)}...\n[read more](${url})` : body}`,
      footer: {
        text: `${frags} frags`,
      },
    });

    await send(msg, { embeds: [embed] });
  }
}
