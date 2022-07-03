import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import { Message, MessageEmbed, Util } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { weightedRandom } from "#utils/random";
import { isAfter, add, addDays, formatDistanceToNowStrict } from "date-fns";
import PayloadColors from "#utils/colors";
import { chunk, codeBlock } from "@sapphire/utilities";
import { LanguageKeys } from "#lib/i18n/all";
import { LazyPaginatedMessage } from "@sapphire/discord.js-utilities";
import type { User } from ".prisma/client";

enum PayloadPushResult {
  SUCCESS,
  COOLDOWN,
  CAP,
}

const PUSHCART_CAP = 1000;

@ApplyOptions<PayloadCommand.Options>({
  description: LanguageKeys.Commands.Pushcart.Description,
  detailedDescription: LanguageKeys.Commands.Pushcart.DetailedDescription,
  runIn: ["GUILD_TEXT"],
  subCommands: ["leaderboard", "rank", "gift", "servers", { input: "push", output: "push", default: true }],
})
export class UserCommand extends PayloadCommand {
  @RequiresGuildContext()
  async push(msg: Message, args: PayloadCommand.Args) {
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

    const { t } = args;

    const { result, lastActive } = await this.userPushcart(msg.author.id, randomNumber);

    if (result === PayloadPushResult.COOLDOWN) {
      const timeLeft = Math.round((lastActive.getMilliseconds() + 1000 * 30 - Date.now()) / 1000);

      return await send(msg, t(LanguageKeys.Commands.Pushcart.Cooldown, { seconds: timeLeft }));
    } else if (result === PayloadPushResult.CAP) {
      const timeLeft = formatDistanceToNowStrict(addDays(lastActive, 1));

      return await send(msg, t(LanguageKeys.Commands.Pushcart.Maxpoints, { expires: timeLeft }));
    }

    const { pushed } = await this.database.guild.upsert({
      where: { id: msg.guildId! },
      create: { id: msg.guildId!, pushed: randomNumber },
      update: { pushed: { increment: randomNumber } },
      select: {
        pushed: true,
      },
    });

    return await send(
      msg,
      t(LanguageKeys.Commands.Pushcart.PushSuccess, {
        units: randomNumber,
        total: pushed,
      })
    );
  }

  @RequiresGuildContext()
  async gift(msg: Message, args: PayloadCommand.Args) {
    const targetUser = await args.pick("member").catch(() => null);
    const amount = await args.pick("number").catch(() => 0);

    const { t } = args;

    if (amount === 0) {
      return await send(msg, t(LanguageKeys.Commands.Pushcart.NoAmount));
    }

    if (!targetUser) {
      return await send(msg, t(LanguageKeys.Commands.Pushcart.NoTargetUser));
    }

    const safeAmount = Math.abs(amount);

    const fromUser = await this.database.user.findUnique({
      where: { id: msg.author.id },
      select: {
        pushed: true,
      },
    });

    if (!fromUser?.pushed || (fromUser.pushed < safeAmount ?? true)) {
      return await send(msg, t(LanguageKeys.Commands.Pushcart.NotEnoughCreds));
    }

    await this.database.user.upsert({
      where: { id: targetUser.id },
      create: { id: msg.author.id, pushed: safeAmount },
      update: { pushed: { increment: safeAmount } },
      select: {},
    });

    await this.database.user.update({
      where: { id: msg.author.id },
      data: {
        pushed: { decrement: safeAmount },
      },
      select: {},
    });

    return await send(
      msg,
      t(LanguageKeys.Commands.Pushcart.GiftSuccess, {
        from: msg.author.tag,
        to: targetUser.user.tag,
        count: amount,
      })
    );
  }

  async leaderboard(msg: Message, args: PayloadCommand.Args) {
    const { client } = this.container;

    const loadingEmbed = new MessageEmbed().setDescription("Loading...").setColor("RANDOM");

    const paginationEmbed = new LazyPaginatedMessage({
      template: new MessageEmbed()
        .setColor("BLUE")
        .setTitle(args.t(LanguageKeys.Commands.Pushcart.LeaderboardEmbedTitle)),
    });

    const leaderboard = await this.database.user.findMany({
      where: {
        NOT: {
          pushed: { lt: 1 },
        },
      },
      select: {
        id: true,
        pushed: true,
      },
      orderBy: [{ pushed: "desc" }],
      take: 25,
    });

    const CHUNK_AMOUNT = 5;
    let rank = 1;

    for (const page of chunk(leaderboard, CHUNK_AMOUNT)) {
      const leaderboardString = await Promise.all(
        page.map(async ({ id, pushed }, i) => {
          const { username } = await client.users.fetch(id).catch(() => ({ username: "-" }));

          return msg.author.username === username
            ? `> ${rank + i}: ${Util.escapeMarkdown(username)} (${pushed})`
            : `${rank + i}: ${Util.escapeMarkdown(username)} (${pushed})`;
        })
      );

      const embed = new MessageEmbed({
        title: args.t(LanguageKeys.Commands.Pushcart.LeaderboardEmbedTitle),
        description: codeBlock("md", leaderboardString.join("\n")),
        color: PayloadColors.User,
      });

      paginationEmbed.addPageEmbed(embed);

      rank += CHUNK_AMOUNT;
    }

    const response = await msg.channel.send({ embeds: [loadingEmbed] });

    await paginationEmbed.run(response, msg.author);

    return response;
  }

  async rank(msg: Message, args: PayloadCommand.Args) {
    const targetUser = await args.pick("user").catch(() => msg.author);

    const userRank = await this.database.$queryRaw<(User & { rank: number }) | null>`
      SELECT ROW_NUMBER() OVER (ORDER BY pushed DESC) AS rank, pushed FROM users WHERE id = ${targetUser.id}
    `;

    if (userRank == null) {
      // TODO: make this a different message
      return await send(msg, codeBlock("md", `-: ${targetUser.tag} (0)`));
    }

    return await send(msg, codeBlock("md", `#${userRank.rank}: ${targetUser.tag} (${userRank.pushed})`));
  }

  async servers(msg: Message, args: PayloadCommand.Args) {
    const { client } = this.container;

    const loadingEmbed = new MessageEmbed().setDescription("Loading...").setColor("RANDOM");

    const paginationEmbed = new LazyPaginatedMessage({
      template: new MessageEmbed().setColor("BLUE").setTitle(args.t(LanguageKeys.Commands.Pushcart.ServerEmbedTitle)),
    });

    const leaderboard = await this.database.guild.findMany({
      where: {
        NOT: {
          pushed: { lt: 1 },
        },
      },
      select: {
        id: true,
        pushed: true,
      },
      orderBy: [{ pushed: "desc" }],
      take: 25,
    });

    const CHUNK_AMOUNT = 5;
    let rank = 1;

    for (const page of chunk(leaderboard, CHUNK_AMOUNT)) {
      const leaderboardString = await Promise.all(
        page.map(async ({ id, pushed }, i) => {
          const { name, id: gid } = await client.guilds.fetch(id).catch(() => ({ name: "-", id: null }));

          return msg.guildId! === gid
            ? `> ${rank + i}: ${Util.escapeMarkdown(name)} (${pushed})`
            : `${rank + i}: ${Util.escapeMarkdown(name)} (${pushed})`;
        })
      );

      const embed = new MessageEmbed({
        title: args.t(LanguageKeys.Commands.Pushcart.ServerEmbedTitle),
        description: codeBlock("md", leaderboardString.join("\n")),
        color: PayloadColors.User,
      });

      paginationEmbed.addPageEmbed(embed);

      rank += CHUNK_AMOUNT;
    }

    const response = await msg.channel.send({ embeds: [loadingEmbed] });

    await paginationEmbed.run(response, msg.author);

    return response;
  }

  private async userPushcart(id: string, units: number) {
    const { lastActive, pushedToday } = await this.database.user.upsert({
      where: { id },
      create: { id },
      update: {},
      select: {
        lastActive: true,
        pushedToday: true,
      },
    });

    const isUnderCooldown = isAfter(add(lastActive, { seconds: 30 }), Date.now());

    const shouldRefreshCap = isAfter(Date.now(), add(lastActive, { days: 1 }));

    const hasReachedMaxPoints = pushedToday >= PUSHCART_CAP;
    let needsResetPushedToday = false;

    if (isUnderCooldown) {
      return { result: PayloadPushResult.CAP, lastActive };
    } else if (hasReachedMaxPoints) {
      if (shouldRefreshCap) {
        needsResetPushedToday = true;
      } else {
        return { result: PayloadPushResult.CAP, lastActive };
      }
    }

    const pushedTodayQuery = needsResetPushedToday ? 0 : { increment: units };
    const newDate = new Date();
    const newLastActiveDate = needsResetPushedToday ? newDate : lastActive;

    await this.database.user.update({
      where: { id },
      data: {
        pushed: { increment: units },
        pushedToday: pushedTodayQuery,
        lastActive: newDate,
      },
      select: {},
    });

    return { result: PayloadPushResult.SUCCESS, lastActive: newLastActiveDate };
  }
}
