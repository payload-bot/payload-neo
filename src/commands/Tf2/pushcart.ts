import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import {
  bold,
  Colors,
  EmbedBuilder,
  escapeMarkdown,
  GuildMember,
  Message,
} from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { weightedRandom } from "#utils/random.ts";
import PayloadColors from "#utils/colors.ts";
import {
  chunk,
  codeBlock,
  isNullOrUndefinedOrEmpty,
} from "@sapphire/utilities";
import { LanguageKeys } from "#lib/i18n/all";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { Args, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import {
  Subcommand,
  type SubcommandMappingArray,
} from "@sapphire/plugin-subcommands";
import { fetchT } from "@sapphire/plugin-i18next";
import { pushcart } from "#root/drizzle/schema.ts";
import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  lte,
  max,
  sql,
  sum,
} from "drizzle-orm";

enum PayloadPushResult {
  SUCCESS,
  COOLDOWN,
  CAP,
}

const SECONDS_COOLDOWN = 30;

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
      messageRun: async (msg) => await this.push(msg),
      default: true,
    },
    {
      name: "leaderboard",
      type: "method",
      messageRun: async (msg) => await this.leaderboard(msg),
    },
    {
      name: "stats",
      type: "method",
      messageRun: async (msg) => await this.stats(msg),
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

    const { result, cooldownExpires } = await this
      .checkUserPushCooldown(
        msg.author.id,
        msg.guildId!,
      );

    if (result === PayloadPushResult.COOLDOWN) {
      return await send(
        msg,
        t(LanguageKeys.Commands.Pushcart.Cooldown, {
          seconds: cooldownExpires?.seconds,
        }),
      );
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

    await this.database.insert(pushcart).values({
      pushed: randomNumber,
      guildId: msg.guildId!,
      userId: msg.author.id,
      timestamp: Temporal.Now.instant().epochMilliseconds.toString()
    });

    const [{ pushed }] = await this.database
      .select({ pushed: sum(pushcart.pushed) })
      .from(pushcart)
      .where(eq(pushcart.guildId, msg.guildId!));

    return await send(
      msg,
      t(LanguageKeys.Commands.Pushcart.PushSuccess, {
        units: randomNumber,
        total: pushed,
      }),
    );
  }

  @RequiresGuildContext()
  async leaderboard(msg: Message) {
    const { client } = this.container;

    const loadingEmbed = new EmbedBuilder().setDescription("Loading...")
      .setColor(Colors.Gold);

    const t = await this.t(msg);

    const paginationEmbed = new PaginatedMessage({
      template: new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(t(LanguageKeys.Commands.Pushcart.LeaderboardEmbedTitle)),
    });

    const userLeaderboard = await this.database
      .select({
        userId: pushcart.userId,
        pushed: sum(pushcart.pushed).mapWith(Number),
      })
      .from(pushcart)
      .where(eq(pushcart.guildId, msg.guildId!))
      .groupBy(pushcart.userId, pushcart.guildId);

    if (userLeaderboard.length === 0) {
      return;
    }

    const CHUNK_AMOUNT = 5;

    const sorted = userLeaderboard.sort((a, b) => b.pushed - a.pushed);

    for (const page of chunk(sorted, CHUNK_AMOUNT)) {
      const leaderboardString = page.map(({ userId, pushed }, index) => {
        const user = client.users.cache.get(userId) ?? null;

        return msg.author.id === userId
          ? `> ${index + 1}: ${
            escapeMarkdown(user?.username ?? "N/A")
          } (${pushed})`
          : `${index + 1}: ${
            escapeMarkdown(user?.username ?? "N/A")
          } (${pushed})`;
      });

      const embed = new EmbedBuilder({
        title: t(LanguageKeys.Commands.Pushcart.LeaderboardEmbedTitle),
        description: codeBlock("md", leaderboardString.join("\n")),
        color: PayloadColors.User,
      });

      paginationEmbed.addPageEmbed(embed);
    }

    if (msg.channel.isSendable()) {
      const response = await msg.channel.send({ embeds: [loadingEmbed] });

      await paginationEmbed.run(response, msg.author);

      return response;
    }

    return;
  }

  @RequiresGuildContext()
  async rank(msg: Message, args: Args) {
    const t = await this.t(msg);
    const targetUser = await args.pick("member").catch(() => msg.author);

    const [data] = await this.database
      .select({
        sum: sum(pushcart.pushed).mapWith(Number).as("sum"),
        rank: sql`ROW_NUMBER() OVER (ORDER BY pushed DESC)`.mapWith(Number).as(
          "rank",
        ),
        userId: pushcart.userId,
      })
      .from(pushcart)
      .where(eq(pushcart.guildId, msg.guildId!))
      .groupBy(pushcart.userId);

    let memberNameToDisplay = targetUser instanceof GuildMember
      ? (targetUser.nickname ?? targetUser.displayName)
      : targetUser.username;

    memberNameToDisplay ??= "N/A";

    if (isNullOrUndefinedOrEmpty(data)) {
      return await send(
        msg,
        t(LanguageKeys.Commands.Pushcart.RankString, {
          name: escapeMarkdown(memberNameToDisplay),
          count: 0,
        }),
      );
    }

    return await send(
      msg,
      codeBlock(
        "md",
        t(LanguageKeys.Commands.Pushcart.RankString, {
          name: memberNameToDisplay,
          rank: data?.rank ?? "-",
          count: data?.sum ?? 0,
        }),
      ),
    );
  }

  @RequiresGuildContext()
  async stats(msg: Message) {
    const t = await this.t(msg);
    const guild = await msg.client.guilds.fetch(msg.guildId!);

    const [{ pushed }] = await this.database
      .select({ pushed: count(pushcart.pushed) })
      .from(pushcart)
      .where(eq(pushcart.guildId, guild.id));

    if (pushed === 0) {
      return await send(msg, t(LanguageKeys.Commands.Pushcart.NoPushesYet));
    }

    const [{ totalPushed, totalUnitsPushed, distinctPushers }] = await this
      .database
      .select({
        totalPushed: count(pushcart.pushed),
        totalUnitsPushed: sum(pushcart.pushed).mapWith(Number),
        distinctPushers: countDistinct(pushcart.userId),
      })
      .from(pushcart)
      .where(eq(pushcart.guildId, guild.id));

    const userStatisticsQuery = await this.database
      .select({
        userId: pushcart.userId,
        count: count(pushcart.pushed),
        sum: sum(pushcart.pushed).mapWith(Number),
      })
      .from(pushcart)
      .where(eq(pushcart.guildId, guild.id))
      .groupBy(pushcart.userId)
      .orderBy(desc(pushcart.userId))
      .limit(5);

    const userIdsToFetch = userStatisticsQuery.map((query) => query.userId);

    for (const id of userIdsToFetch) {
      await guild.members.fetch(id);
    }

    const topFiveSortedPushers = userStatisticsQuery.sort((a, b) =>
      b.count - a.count
    );
    const topFiveSummedPushers = userStatisticsQuery.sort((a, b) =>
      b.sum - a.sum
    );

    const activePushersLeaderboard = topFiveSortedPushers.map(
      ({ count, userId }, index) => {
        const member = guild.members.cache.get(userId);

        const name = escapeMarkdown(
          member?.nickname ?? member?.user.username ?? "N/A",
        );

        const nameToDisplay = msg.author.id === userId
          ? bold(escapeMarkdown(name))
          : escapeMarkdown(name);

        return t(LanguageKeys.Commands.Pushcart.RankString, {
          name: nameToDisplay,
          rank: index + 1,
          count: count ?? 0,
        });
      },
    );

    const topPushersLeaderboard = topFiveSummedPushers.map(
      ({ userId, sum }, index) => {
        const member = guild.members.cache.get(userId);

        const name = escapeMarkdown(
          member?.nickname ?? member?.user.username ?? "N/A",
        );

        const nameToDisplay = msg.author.id === userId ? bold(name) : name;

        return t(LanguageKeys.Commands.Pushcart.RankString, {
          name: nameToDisplay,
          rank: index + 1,
          count: sum ?? 0,
        });
      },
    );

    const embed = new EmbedBuilder()
      .setColor(PayloadColors.Payload)
      .setTitle(
        t(LanguageKeys.Commands.Pushcart.StatsTitle, { name: guild.name }),
      )
      .addFields(
        {
          name: t(LanguageKeys.Commands.Pushcart.TotalUnitsPushedTitle),
          value: t(LanguageKeys.Commands.Pushcart.TotalUnitsPushed, {
            count: totalUnitsPushed,
          }),
          inline: true,
        },
        {
          name: t(LanguageKeys.Commands.Pushcart.TotalPushedTitle),
          value: t(LanguageKeys.Commands.Pushcart.TotalPushed, {
            count: totalPushed,
          }),
          inline: true,
        },
        {
          name: t(LanguageKeys.Commands.Pushcart.DistinctPushersTitle),
          value: t(LanguageKeys.Commands.Pushcart.DistinctPushers, {
            count: distinctPushers,
          }),
          inline: true,
        },
      )
      .addFields(
        {
          name: t(LanguageKeys.Commands.Pushcart.TopPushers),
          value: topPushersLeaderboard.join("\n"),
          inline: true,
        },
        {
          name: t(LanguageKeys.Commands.Pushcart.ActivePushers),
          value: activePushersLeaderboard.join("\n"),
          inline: true,
        },
      );

    return await send(msg, { embeds: [embed] });
  }

  private async checkUserPushCooldown(
    userId: string,
    guildId: string,
  ): Promise<
    {
      result: PayloadPushResult;
      lastPushed: Temporal.Instant;
      cooldownExpires?: Temporal.Duration;
    }
  > {
    const now = Temporal.Now.instant();
    const oneDayFromNow = now.add({ hours: 24 });

    const result = await this.database
      .select({
        userId: pushcart.userId,
        lastPushed: max(pushcart.timestamp).mapWith((s) =>
          Temporal.Instant.fromEpochMilliseconds(s)
        ),
      })
      .from(pushcart)
      .where(
        and(
          eq(pushcart.userId, userId),
          eq(pushcart.guildId, guildId),
          lte(
            pushcart.timestamp,
            oneDayFromNow.epochMilliseconds.toString(),
          ),
        ),
      )
      .groupBy(pushcart.userId, pushcart.guildId);

    if (result.length === 0) {
      return {
        result: PayloadPushResult.SUCCESS,
        lastPushed: Temporal.Now.instant(),
      };
    }

    const [{ lastPushed }] = result;
    const secondsSinceLastPushed = lastPushed.until(now, {
      smallestUnit: "milliseconds",
    }).round({ smallestUnit: "milliseconds" });

    if (secondsSinceLastPushed.seconds < SECONDS_COOLDOWN) {
      const cooldownExpires = lastPushed.add({
        seconds: SECONDS_COOLDOWN,
      }).until(
        now,
        {
          smallestUnit: "milliseconds",
        },
      ).abs();

      return {
        result: PayloadPushResult.COOLDOWN,
        lastPushed,
        cooldownExpires,
      };
    }

    return { result: PayloadPushResult.SUCCESS, lastPushed };
  }
}
