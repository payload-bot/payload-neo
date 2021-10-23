import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { Server } from "#lib/models/Server";
import { weightedRandom } from "#utils/random";
import { User } from "#lib/models/User";
import { isAfter, add } from "date-fns";

enum PayloadPushResult {
  SUCCESS,
  COOLDOWN,
  CAP,
}

const PUSHCART_CAP = 1000;

@ApplyOptions<PayloadCommand.Options>({
  description: "Pushes the cart.",
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

    const result = await this.userPushcart(msg.author.id, randomNumber);

    //const user = await User.findOne({ id: msg.author.id }).lean().exec();

    if (result === PayloadPushResult.COOLDOWN) {
      //   const secondsRemaining = Math.round(
      //     (user.user.fun!.payload.lastPushed + 1000 * 30 - Date.now()) / 1000
      //   );

      return await send(msg, "wait this long");
    } else if (result === PayloadPushResult.CAP) {
      //   const timeLeft = formatDistanceToNowStrict(user.fun.payload.lastActiveDate);

      return await send(msg, "wait this long, you reached cap");
    }

    await Server.findOneAndUpdate(
      { id: msg.guild!.id },
      { $inc: { "fun.payloadFeetPushed": randomNumber } },
      { upsert: true }
    );

    return await send(msg, `pushed ${randomNumber}`);
  }

  @RequiresGuildContext()
  async gift(msg: Message, args: PayloadCommand.Args) {
    const targetUser = await args.pick("member").catch(() => null);
    const amount = await args.pick("number").catch(() => 0);

    if (amount === 0) {
      return await send(msg, "no amount!");
    }

    if (!targetUser) {
      return await send(msg, "no targeted user!");
    }

    const safeAmount = Math.abs(amount);

    const fromUser = await User.findOne(
      { id: msg.author.id },
      {},
      { upsert: true }
    );

    if (!fromUser?.fun?.payload?.feetPushed) {
      return await send(msg, "not creds at all");
    }

    if (fromUser.fun.payload.feetPushed < safeAmount ?? true) {
      return await send(msg, "not enough creds");
    }

    const toUser = await User.findOne(
      { id: targetUser.id },
      {},
      { upsert: true }
    );

    fromUser.fun.payload.feetPushed -= safeAmount;
    toUser!.fun!.payload!.feetPushed += safeAmount;

    await Promise.all([fromUser.save(), toUser!.save()]);

    return await send(msg, "successfully done the transaction");
  }

  private async userPushcart(id: string, units: number) {
    const user = await User.findOne({ id }, {}, { upsert: true });

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
      add(fun.payload.lastPushed, { seconds: 1 }),
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
