import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { weightedRandom } from "#utils/random.ts";
import { LanguageKeys } from "#lib/i18n/all";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { Subcommand, type SubcommandMappingArray } from "@sapphire/plugin-subcommands";
import { fetchT } from "@sapphire/plugin-i18next";
import { and, eq, lte, max, sum } from "drizzle-orm";
import { pushcart } from "../../db/schema/pushcart.ts";

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
      timestamp: Temporal.Now.instant().epochMilliseconds.toString(),
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
        lastPushed: max(pushcart.timestamp).mapWith((s) => Temporal.Instant.fromEpochMilliseconds(s)),
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
      }).until(now, { smallestUnit: "milliseconds" }).abs();

      return {
        result: PayloadPushResult.COOLDOWN,
        lastPushed,
        cooldownExpires,
      };
    }

    return { result: PayloadPushResult.SUCCESS, lastPushed };
  }
}
