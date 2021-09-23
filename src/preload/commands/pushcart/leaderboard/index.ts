import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message, MessageEmbed, Util } from "discord.js";
import Language from "../../../../lib/types/Language";
import PayloadColors from "../../../../lib/misc/colors";
import { codeBlock } from "@discordjs/builders";

export default class Leaderboard extends Command {
  constructor() {
    super(
      "leaderboard",
      "Shows the pushcart user leaderboard.",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      ["pushcart"]
    );
  }

  async run(client: Client, msg: Message): Promise<boolean> {
    const lang: Language = await this.getLanguage(msg);

    if (!client.leaderboard) {
      return await this.fail(msg, lang.pushcart_fail_noleaderboard);
    }

    const top10 = client.leaderboard.users.slice(0, 10);

    let isTop10 = false;

    const leaderboardString = await Promise.all(
      top10.map(async ({ id, pushed }, i) => {
        const { tag } = await client.users.fetch(id);

        let localIsTop10 = false;
        if (msg.author.id === id) {
          isTop10 = true;
          localIsTop10 = true;
        }

        return `${localIsTop10 ? "> " : ""}${i + 1}: ${Util.escapeMarkdown(
          tag
        )} (${pushed})`;
      })
    );

    if (!isTop10) {
      leaderboardString.push(
        `...\n> ${
          client.leaderboard.users.findIndex(
            (user) => user.id == msg.author.id
          ) + 1
        }: ${Util.escapeMarkdown(msg.author.tag)} (${
          (
            client.leaderboard.users.find(
              (user) => user.id == msg.author.id
            ) || {
              pushed: 0,
            }
          ).pushed
        })`
      );
    }

    const embeds = [
      new MessageEmbed({
        title: lang.pushcart_userembedtitle,
        description: codeBlock("md", leaderboardString.join("\n")),
        footer: {
          text: lang.pushcart_userembedfooter.replace(
            "%updated",
            client.leaderboard.updated.toLocaleString()
          ),
        },
        color: PayloadColors.USER,
      }),
    ];

    await msg.channel.send({ embeds });

    return true;
  }
}
