import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import { Message, EmbedBuilder, escapeMarkdown, Colors, bold, GuildMember } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { weightedRandom } from "#utils/random";
import { isAfter, add, addDays, formatDistanceToNowStrict, addSeconds, differenceInSeconds } from "date-fns";
import PayloadColors from "#utils/colors";
import { chunk, codeBlock, isNullOrUndefined } from "@sapphire/utilities";
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
      name: "stats",
      type: "method",
      messageRun: async msg => await this.stats(msg),
    },
    {
      name: "rank",
      type: "method",
      messageRun: async (msg, args) => await this.rank(msg, args),
    },
  ];

  @RequiresGuildContext()
  async push(msg: Message) {
    const t = await this.t(msg);

    const { result, lastPushed } = await this.userPushcart(msg.author.id, msg.guildId!);

    if (result === PayloadPushResult.COOLDOWN) {
      const secondsLeft = differenceInSeconds(addSeconds(lastPushed!, 30), new Date());

      return await send(msg, t(LanguageKeys.Commands.Pushcart.Cooldown, { seconds: secondsLeft })!);
    } else if (result === PayloadPushResult.CAP) {
      const timeLeft = formatDistanceToNowStrict(addDays(lastPushed!, 1));

      return await send(msg, t(LanguageKeys.Commands.Pushcart.Maxpoints, { expires: timeLeft }));
    }

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

    await this.database.pushcart.create({
      data: {
        pushed: randomNumber,
        guildId: msg.guildId!,
        userId: msg.author.id,
      },
      select: { pushed: true },
    });

    const {
      _sum: { pushed: totalUnitsPushed },
    } = await this.database.pushcart.aggregate({
      where: {
        guildId: msg.guildId!,
      },
      _count: {
        pushed: true,
      },
      _sum: {
        pushed: true,
      },
    });

    return await send(
      msg,
      t(LanguageKeys.Commands.Pushcart.PushSuccess, {
        units: randomNumber,
        total: totalUnitsPushed,
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
      by: ["userId", "guildId"],
      where: {
        guildId: msg.guildId!,
      },
      _sum: {
        pushed: true,
      },
    });

    if (userLeaderboard.length === 0) {
      return;
    }

    const CHUNK_AMOUNT = 5;

    const sorted = userLeaderboard.sort((a, b) => b._sum.pushed! - a._sum.pushed!);

    for (const page of chunk(sorted, CHUNK_AMOUNT)) {
      const leaderboardString = page.map(({ userId, _sum: { pushed } }, index) => {
        const user = client.users.cache.get(userId) ?? null;

        return msg.author.id === userId
          ? `> ${index + 1}: ${escapeMarkdown(user?.username ?? "N/A")} (${pushed})`
          : `${index + 1}: ${escapeMarkdown(user?.username ?? "N/A")} (${pushed})`;
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
    const t = await this.t(msg);
    const targetUser = await args.pick("member").catch(() => msg.author);

    const result = await this.database.$queryRaw<Array<{ rank: number; pushed: number }>>`
      WITH leaderboard AS (SELECT ROW_NUMBER() OVER (ORDER BY pushed DESC) AS rank, SUM(pushed) as pushed, userId FROM "main"."Pushcart" WHERE guildId = ${msg.guildId!} GROUP BY userId)
      SELECT * from leaderboard WHERE userId = ${targetUser.id}`;

    const [userRank] = result;

    let memberNameToDisplay =
      targetUser instanceof GuildMember ? targetUser.nickname ?? targetUser.displayName : targetUser.username;

    memberNameToDisplay ??= "N/A";

    if (isNullOrUndefined(result[0])) {
      return await send(
        msg,
        t(LanguageKeys.Commands.Pushcart.RankString, {
          name: memberNameToDisplay,
          count: Number(userRank?.pushed ?? 0),
        })
      );
    }

    return await send(
      msg,
      codeBlock(
        "md",
        t(LanguageKeys.Commands.Pushcart.RankString, {
          name: memberNameToDisplay,
          rank: userRank.rank ?? "-",
          count: Number(userRank?.pushed ?? 0),
        })
      )
    );
  }

  @RequiresGuildContext()
  async stats(msg: Message) {
    await msg.channel.sendTyping();

    const t = await this.t(msg);
    const guild = await msg.client.guilds.fetch(msg.guildId!);

    const serverHasPushedCheck = await this.database.pushcart.count({
      where: {
        guildId: guild.id,
      },
    });

    if (serverHasPushedCheck === 0) {
      return await send(msg, t(LanguageKeys.Commands.Pushcart.NoPushesYet));
    }

    const {
      _count: { pushed: totalPushed },
      _sum: { pushed: totalUnitsPushed },
    } = await this.database.pushcart.aggregate({
      where: {
        guildId: guild.id,
      },
      _count: {
        pushed: true,
      },
      _sum: {
        pushed: true,
      },
    });

    const [{ distinctPushers }] = await this.database.$queryRaw<
      Array<{
        distinctPushers: number;
      }>
    >`SELECT COUNT(DISTINCT userId) as distinctPushers FROM "main"."Pushcart" WHERE guildId = ${guild.id}`;

    const userStatisticsQuery = await this.database.pushcart.groupBy({
      by: ["userId", "guildId"],
      where: {
        guildId: guild.id,
      },
      _count: {
        pushed: true,
      },
      _sum: {
        pushed: true,
      },
      orderBy: [
        {
          userId: "desc",
        },
      ],
      take: 5,
    });

    const userIdsToFetch = userStatisticsQuery.map(query => query.userId);

    for (const id of userIdsToFetch) {
      await guild.members.fetch(id);
    }

    const topFiveSortedPushers = userStatisticsQuery.sort((a, b) => b._count.pushed - a._count.pushed);
    const topFiveSummedPushers = userStatisticsQuery.sort((a, b) => b._sum.pushed! - a._sum.pushed!);

    const activePushersLeaderboard = topFiveSortedPushers.map(({ _count: { pushed: timesPushed }, userId }, index) => {
      const member = guild.members.cache.get(userId);

      const name = escapeMarkdown(member?.nickname ?? member?.user.username ?? "N/A");

      const nameToDisplay = msg.author.id === userId ? bold(name) : name;

      return t(LanguageKeys.Commands.Pushcart.RankString, {
        name: nameToDisplay,
        rank: index + 1,
        count: timesPushed ?? 0,
      });
    });

    const topPushersLeaderboard = topFiveSummedPushers.map(({ userId, _sum: { pushed: totalPushed } }, index) => {
      const member = guild.members.cache.get(userId);

      const name = escapeMarkdown(member?.nickname ?? member?.user.username ?? "N/A");

      const nameToDisplay = msg.author.id === userId ? bold(name) : name;

      return t(LanguageKeys.Commands.Pushcart.RankString, {
        name: nameToDisplay,
        rank: index + 1,
        count: totalPushed ?? 0,
      });
    });

    const embed = new EmbedBuilder()
      .setColor(PayloadColors.Payload)
      .setTitle(t(LanguageKeys.Commands.Pushcart.StatsTitle, { name: guild.name }))
      .addFields(
        {
          name: t(LanguageKeys.Commands.Pushcart.TotalUnitsPushedTitle),
          value: t(LanguageKeys.Commands.Pushcart.TotalUnitsPushed, { count: Number(totalUnitsPushed ?? 0) }),
          inline: true,
        },
        {
          name: t(LanguageKeys.Commands.Pushcart.TotalPushedTitle),
          value: t(LanguageKeys.Commands.Pushcart.TotalPushed, { count: Number(totalPushed) }),
          inline: true,
        },
        {
          name: t(LanguageKeys.Commands.Pushcart.DistinctPushersTitle),
          value: t(LanguageKeys.Commands.Pushcart.DistinctPushers, { count: Number(distinctPushers) }),
          inline: true,
        }
      )
      .addFields(
        { name: t(LanguageKeys.Commands.Pushcart.TopPushers), value: topPushersLeaderboard.join("\n"), inline: true },
        {
          name: t(LanguageKeys.Commands.Pushcart.ActivePushers),
          value: activePushersLeaderboard.join("\n"),
          inline: true,
        }
      );

    return await send(msg, { embeds: [embed] });
  }

  private async userPushcart(userId: string, guildId: string) {
    const result = await this.database.pushcart.groupBy({
      by: ["userId", "guildId"],
      _max: {
        timestamp: true,
      },
      _sum: {
        pushed: true,
      },
      where: {
        userId,
        guildId,
        timestamp: {
          lte: add(Date.now(), { days: 1 }),
        },
      },
    });

    if (result.length === 0) {
      return { result: PayloadPushResult.SUCCESS, lastPushed: new Date() };
    }

    const [
      {
        _sum: { pushed: totalPushedLastDay },
        _max: { timestamp: lastPushed },
      },
    ] = result;

    const isUnderCooldown = isAfter(add(lastPushed!, { seconds: 30 }), Date.now());

    const shouldRefreshCap = isAfter(Date.now(), add(lastPushed!, { days: 1 }));

    const hasReachedMaxPoints = totalPushedLastDay! >= PUSHCART_CAP;

    if (isUnderCooldown && totalPushedLastDay! !== 0) {
      return { result: PayloadPushResult.COOLDOWN, lastPushed };
    } else if (hasReachedMaxPoints && !shouldRefreshCap) {
      return { result: PayloadPushResult.CAP, lastPushed };
    }

    return { result: PayloadPushResult.SUCCESS, lastPushed };
  }
}
