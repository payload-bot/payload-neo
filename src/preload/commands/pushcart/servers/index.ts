import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message, MessageEmbed, Util } from "discord.js";
import { Server } from "../../../../lib/model/Server";
import Language from "../../../../lib/types/Language";
import PayloadColors from "../../../../lib/misc/colors";
import { codeBlock } from "@discordjs/builders";

export default class Servers extends Command {
  constructor() {
    super(
      "servers",
      "Shows the top 5 pushcart servers.",
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
    await msg.channel.sendTyping();

    const leaderboard = await Server.aggregate([
      { $match: { fun: { $exists: 1 } } },
      { $project: { id: "$id", pushed: "$fun.payloadFeetPushed" } },
      { $sort: { pushed: -1 } },
      { $limit: 5 },
    ]);

    const leaderboardString = await Promise.all(
      leaderboard.map(async ({ id, pushed }, i) => {
        const { name } = await client.guilds.fetch(id);

        return msg.guild.name === name
          ? `> ${i + 1}: ${Util.escapeMarkdown(name)} (${pushed})`
          : `${i + 1}: ${Util.escapeMarkdown(name)} (${pushed})`;
      })
    );

    const embeds = [
      new MessageEmbed({
        title: lang.pushcart_serverembedtitle,
        description: codeBlock("md", leaderboardString.join("\n")),
        color: PayloadColors.USER,
      }),
    ];

    await msg.channel.send({ embeds });

    return true;
  }
}
