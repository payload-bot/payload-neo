import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import { Message, MessageEmbed, Util } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { Server } from "#lib/models/Server";
import { weightedRandom } from "#utils/random";
import { User } from "#lib/models/User";
import { isAfter, add, addDays, formatDistanceToNowStrict } from "date-fns";
import PayloadColors from "#utils/colors";
import { chunk, codeBlock } from "@sapphire/utilities";
import { LanguageKeys } from "#lib/i18n/all";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";

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
  subCommands: [
    "leaderboard",
    "rank",
    "gift",
    "servers",
    { input: "push", output: "push", default: true },
  ],
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

    const result = await this.userPushcart(msg.author.id, randomNumber);

    const user = await User.findOne({ id: msg.author.id }).lean();

    if (result === PayloadPushResult.COOLDOWN) {
      const timeLeft = Math.round(
        (user!.fun!.payload.lastPushed + 1000 * 30 - Date.now()) / 1000
      );

      return await send(
        msg,
        t(LanguageKeys.Commands.Pushcart.Cooldown, { seconds: timeLeft })
      );
    } else if (result === PayloadPushResult.CAP) {
      const timeLeft = formatDistanceToNowStrict(
        addDays(user!.fun!.payload.lastActiveDate, 1)
      );

      return await send(
        msg,
        t(LanguageKeys.Commands.Pushcart.Maxpoints, { expires: timeLeft })
      );
    }

    const server = await Server.findOneAndUpdate(
      { id: msg.guild!.id },
      { $inc: { "fun.payloadFeetPushed": randomNumber } },
      { upsert: true, new: true }
    );

    return await send(
      msg,
      t(LanguageKeys.Commands.Pushcart.PushSuccess, {
        units: randomNumber,
        total: server!.fun!.payloadFeetPushed,
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

    const fromUser = await User.findOne(
      { id: msg.author.id },
      {},
      { upsert: true }
    );

    if (
      !fromUser?.fun?.payload?.feetPushed ||
      (fromUser.fun.payload.feetPushed < safeAmount ?? true)
    ) {
      return await send(msg, t(LanguageKeys.Commands.Pushcart.NotEnoughCreds));
    }

    const toUser = await User.findOne(
      { id: targetUser.id },
      {},
      { upsert: true }
    );

    fromUser.fun.payload.feetPushed -= safeAmount;
    toUser!.fun!.payload!.feetPushed += safeAmount;

    await Promise.all([fromUser.save(), toUser!.save()]);

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

    const loadingEmbed = new MessageEmbed()
      .setDescription("Loading...")
      .setColor("RANDOM");

    const paginationEmbed = new PaginatedMessage({
      template: new MessageEmbed()
        .setColor("BLUE")
        .setTitle(args.t(LanguageKeys.Commands.Pushcart.LeaderboardEmbedTitle)),
    });

    const leaderboard = await User.aggregate([
      { $match: { "fun.payload": { $exists: 1 } } },
      { $project: { id: "$id", pushed: "$fun.payload.feetPushed" } },
      { $sort: { pushed: -1 } },
      { $limit: 125 },
    ]);

    const CHUNK_AMOUNT = 10;
    let rank = 1;

    for (const page of chunk(leaderboard, CHUNK_AMOUNT)) {
      const leaderboardString = await Promise.all(
        page.map(async ({ id, pushed }, i) => {
          const { username } = await client.users
            .fetch(id)
            .catch(() => ({ username: "-" }));

          return msg.author.username === username
            ? `> ${rank + i}: ${Util.escapeMarkdown(username)} (${pushed})`
            : `${rank + i}: ${Util.escapeMarkdown(username)} (${pushed})`;
        })
      );

      const embed = new MessageEmbed({
        title: args.t(LanguageKeys.Commands.Pushcart.LeaderboardEmbedTitle),
        description: codeBlock("md", leaderboardString.join("\n")),
        color: PayloadColors.USER,
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

    const leaderboardSkip10 = await User.aggregate([
      { $match: { "fun.payload": { $exists: 1 } } },
      { $project: { id: "$id", pushed: "$fun.payload.feetPushed" } },
      { $sort: { pushed: -1 } },
    ]);

    const index = leaderboardSkip10.findIndex(
      (user) => user.id === targetUser.id
    );

    if (index === -1) {
      return await send(msg, codeBlock("md", `-: ${targetUser.tag} (0)`));
    }

    const { pushed } = leaderboardSkip10.find(
      (user) => user.id === targetUser.id
    );

    return await send(
      msg,
      codeBlock("md", `#${index + 1}: ${targetUser.tag} (${pushed})`)
    );
  }

  async servers(msg: Message, args: PayloadCommand.Args) {
    const { client } = this.container;

    const loadingEmbed = new MessageEmbed()
      .setDescription("Loading...")
      .setColor("RANDOM");

    const paginationEmbed = new PaginatedMessage({
      template: new MessageEmbed()
        .setColor("BLUE")
        .setTitle(args.t(LanguageKeys.Commands.Pushcart.ServerEmbedTitle)),
    });

    const leaderboard = (await Server.aggregate([
      { $match: { fun: { $exists: 1 } } },
      { $project: { id: "$id", pushed: "$fun.payloadFeetPushed" } },
      { $sort: { pushed: -1 } },
      { $limit: 125 },
    ])) as { id: string; pushed: string }[];

    const CHUNK_AMOUNT = 5;
    let rank = 1;

    for (const page of chunk(leaderboard, CHUNK_AMOUNT)) {
      const leaderboardString = await Promise.all(
        page.map(async ({ id, pushed }, i) => {
          const { name } = await client.guilds
            .fetch(id)
            .catch(() => ({ name: "-" }));

          return msg.guild!.name === name
            ? `> ${rank + i}: ${Util.escapeMarkdown(name)} (${pushed})`
            : `${rank + i}: ${Util.escapeMarkdown(name)} (${pushed})`;
        })
      );

      const embed = new MessageEmbed({
        title: args.t(LanguageKeys.Commands.Pushcart.ServerEmbedTitle),
        description: codeBlock("md", leaderboardString.join("\n")),
        color: PayloadColors.USER,
      });

      paginationEmbed.addPageEmbed(embed);

      rank += CHUNK_AMOUNT;
    }

    const response = await msg.channel.send({ embeds: [loadingEmbed] });

    await paginationEmbed.run(response, msg.author);

    return response;
  }

  private async userPushcart(id: string, units: number) {
    let user = await User.findOne({ id });

    if (!user) user = await User.create({ id });

    const fun = user?.fun ?? {
      payload: {
        feetPushed: 0,
        pushing: false,
        lastPushed: Date.now(),
        pushedToday: 0,
        lastActiveDate: Date.now(),
      },
    };

    fun.payload.feetPushed = fun.payload.feetPushed ?? 0;
    fun.payload.pushedToday = fun.payload.pushedToday ?? 0;

    const isUnderCooldown = isAfter(
      add(fun.payload.lastPushed, { seconds: 30 }),
      Date.now()
    );

    const shouldRefreshCap = isAfter(
      Date.now(),
      add(fun.payload.lastActiveDate, { days: 1 })
    );

    const hasReachedMaxPoints = fun.payload.pushedToday >= PUSHCART_CAP;

    if (isUnderCooldown) return PayloadPushResult.COOLDOWN;
    else if (hasReachedMaxPoints) {
      if (shouldRefreshCap) fun.payload.pushedToday = 0;
      else return PayloadPushResult.CAP;
    }

    fun.payload.feetPushed += units;
    fun.payload.pushedToday += units;
    fun.payload.lastPushed = Date.now();
    fun.payload.lastActiveDate = Date.now();

    await user!.save();

    return PayloadPushResult.SUCCESS;
  }
}
