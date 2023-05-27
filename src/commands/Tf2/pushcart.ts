import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import { Message, EmbedBuilder, escapeMarkdown, Colors, GuildMember } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { weightedRandom } from "#utils/random";
import { isAfter, add, addDays, formatDistanceToNowStrict, addSeconds, differenceInSeconds, sub } from "date-fns";
import PayloadColors from "#utils/colors";
import { chunk, codeBlock } from "@sapphire/utilities";
import { LanguageKeys } from "#lib/i18n/all";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { Args, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { Subcommand, type SubcommandMappingArray } from "@sapphire/plugin-subcommands";
import { fetchT } from "@sapphire/plugin-i18next";

enum PayloadPushResult {
  SUCCESS,
  COOLDOWN,
  CAP,
}

const PUSHCART_CAP = 1000;

@ApplyOptions<Subcommand.Options>({
  description: LanguageKeys.Commands.Pushcart.Description,
  detailedDescription: LanguageKeys.Commands.Pushcart.DetailedDescription,
  runIn: [CommandOptionsRunTypeEnum.GuildText],
})
export class UserCommand extends Subcommand {
  private readonly database = this.container.database;
  private readonly t = async (msg: Message) => await fetchT(msg);

  public readonly subcommandMappings: SubcommandMappingArray = [
    {
      name: "push",
      type: "method",
      messageRun: async msg => await this.push(msg),
      default: true,
    },
    {
      name: "leaderboard",
      type: "method",
      messageRun: async msg => await this.leaderboard(msg),
    },
    {
      name: "rank",
      type: "method",
      messageRun: async (msg, args) => await this.rank(msg, args),
    },
  ];

  @RequiresGuildContext()
  async push(msg: Message) {
    const randomNumber = weightedRandom([
      { number: 3, weight: 2 },
      { number: 4, weight: 3 },
      { number: 5, weight: 5 },
      { number: 6, weight: 8 },
      { number: 7, weight: 16 },
      { number: 8, weight: 16 },
      { number: 9, weight: 16 },
      { number: 10, weight: 16 },
      { number: 11, weight: 18 },
      { number: 12, weight: 18 },
      { number: 13, weight: 16 },
      { number: 14, weight: 8 },
      { number: 15, weight: 5 },
      { number: 16, weight: 3 },
      { number: 17, weight: 2 },
    ]);

    const t = await this.t(msg);

    const { result, lastPushed } = await this.userPushcart(msg.author.id);

    if (result === PayloadPushResult.COOLDOWN) {
      const secondsLeft = differenceInSeconds(addSeconds(lastPushed!, 30), new Date());

      return await send(msg, t(LanguageKeys.Commands.Pushcart.Cooldown, { seconds: secondsLeft })!);
    } else if (result === PayloadPushResult.CAP) {
      const timeLeft = formatDistanceToNowStrict(addDays(lastPushed!, 1));

      return await send(msg, t(LanguageKeys.Commands.Pushcart.Maxpoints, { expires: timeLeft }));
    }

    const { pushed } = await this.database.pushcart.create({
      data: {
        pushed: randomNumber,
        guildId: msg.guildId!,
        userId: msg.author.id,
      },
      select: { pushed: true },
    });

    return await send(
      msg,
      t(LanguageKeys.Commands.Pushcart.PushSuccess, {
        units: randomNumber,
        total: pushed,
      })!
    );
  }

  @RequiresGuildContext()
  async leaderboard(msg: Message) {
    const { client } = this.container;

    const loadingEmbed = new EmbedBuilder().setDescription("Loading...").setColor(Colors.Gold);

    const t = await this.t(msg);

    const paginationEmbed = new PaginatedMessage({
      template: new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(t(LanguageKeys.Commands.Pushcart.LeaderboardEmbedTitle)),
    });

    const userLeaderboard = await this.database.pushcart.groupBy({
      where: {
        guildId: msg.guildId!,
      },
      orderBy: {
        pushed: "desc",
      },
      by: ["userId", "pushed"],
    });

    if (userLeaderboard.length === 0) {
      return;
    }

    const CHUNK_AMOUNT = 5;

    for (const page of chunk(userLeaderboard, CHUNK_AMOUNT)) {
      const leaderboardString = page.map(({ userId, pushed }, index) => {
        const user = client.users.cache.get(userId) ?? null;

        return msg.author.id === userId
          ? `> ${index}: ${escapeMarkdown(user?.username ?? "N/A")} (${pushed})`
          : `${index}: ${escapeMarkdown(user?.username ?? "N/A")} (${pushed})`;
      });

      const embed = new EmbedBuilder({
        title: t(LanguageKeys.Commands.Pushcart.LeaderboardEmbedTitle),
        description: codeBlock("md", leaderboardString.join("\n")),
        color: PayloadColors.User,
      });

      paginationEmbed.addPageEmbed(embed);
    }

    const response = await msg.channel.send({ embeds: [loadingEmbed] });

    await paginationEmbed.run(response, msg.author);

    return response;
  }

  @RequiresGuildContext()
  async rank(msg: Message, args: Args) {
    const targetUser = (await args.pick("member").catch(() => msg.author)) as GuildMember;

    const [userRank] = await this.database.$queryRaw<Array<{ rank: number; pushed: number } | null>>`
      WITH leaderboard AS (SELECT ROW_NUMBER() OVER (ORDER BY pushed DESC) AS rank, pushed FROM "public"."Pushcart" WHERE userId = ${
        targetUser.id
      } AND guildId = ${msg.guildId!})
      SELECT rank, pushed from leaderboard`;

    if (userRank == null) {
      // TODO: make this a different message
      return await send(msg, codeBlock("md", `-: ${targetUser.nickname} (0)`));
    }

    return await send(
      msg,
      codeBlock("md", `#${userRank.rank.toString()}: ${targetUser.nickname} (${userRank.pushed})`)
    );
  }

  private async userPushcart(userId: string) {
    const {
      _max: { timestamp: lastPushed },
      _sum: { pushed: totalPushedLastDay },
    } = await this.database.pushcart.aggregate({
      where: {
        AND: [
          {
            userId,
          },
          {
            timestamp: {
              gt: sub(Date.now(), { days: 1 }),
            },
          },
        ],
      },
      _max: {
        timestamp: true,
      },
      _sum: {
        pushed: true,
      },
    });

    if (lastPushed === null && totalPushedLastDay === null) {
      return { result: PayloadPushResult.SUCCESS, lastPushed: new Date() };
    }

    const isUnderCooldown = isAfter(add(lastPushed!, { seconds: 30 }), Date.now());

    const shouldRefreshCap = isAfter(Date.now(), add(lastPushed!, { days: 1 }));

    const hasReachedMaxPoints = totalPushedLastDay ?? 0 >= PUSHCART_CAP;
    let needsResetPushedToday = false;

    if (isUnderCooldown && (totalPushedLastDay ?? 0) !== 0) {
      return { result: PayloadPushResult.COOLDOWN, lastPushed };
    } else if (hasReachedMaxPoints) {
      if (shouldRefreshCap) {
        needsResetPushedToday = true;
      } else {
        return { result: PayloadPushResult.CAP, lastPushed };
      }
    }

    const newDate = new Date();
    const newLastActiveDate = needsResetPushedToday ? newDate : lastPushed;

    return { result: PayloadPushResult.SUCCESS, lastPushed: newLastActiveDate };
  }
}
