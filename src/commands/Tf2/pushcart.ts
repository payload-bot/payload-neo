import { ChatInputCommandInteraction } from "discord.js";
import { weightedRandom } from "#utils/random.ts";
import { LanguageKeys } from "#lib/i18n/all";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";
import { and, eq, lte, max, sum } from "drizzle-orm";
import { pushcart } from "../../db/schema/pushcart.ts";

const PayloadPushResult = {
  SUCCESS: 1,
  COOLDOWN: 2,
  CAP: 3,
} as const;

const SECONDS_COOLDOWN = 30;

export class PushcartCommand extends Command {
  private readonly database = this.container.database;

  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: LanguageKeys.Commands.Pushcart.Description,
      detailedDescription: LanguageKeys.Commands.Pushcart.DetailedDescription,
      runIn: [CommandOptionsRunTypeEnum.GuildText],
    });
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const t = await fetchT(interaction);

    const { result, cooldownExpires } = await this.checkUserPushCooldown(
      interaction.user.id,
      interaction.guildId!,
    );

    if (result === PayloadPushResult.COOLDOWN) {
      return await interaction.reply(
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
      guildId: interaction.guildId!,
      userId: interaction.user.id,
      timestamp: Temporal.Now.instant().epochMilliseconds.toString(),
    });

    const [{ pushed }] = await this.database
      .select({ pushed: sum(pushcart.pushed) })
      .from(pushcart)
      .where(eq(pushcart.guildId, interaction.guildId!));

    return await interaction.reply(
      t(LanguageKeys.Commands.Pushcart.PushSuccess, {
        units: randomNumber,
        total: pushed,
      }),
    );
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const rootNameLocalizations = getLocalizedData(LanguageKeys.Commands.Pushcart.Name);
    const rootDescriptionLocalizations = getLocalizedData(this.description);

    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(rootDescriptionLocalizations.localizations["en-US"]!)
        .setDescriptionLocalizations(rootDescriptionLocalizations.localizations)
        .setNameLocalizations(rootNameLocalizations.localizations),
    );
  }

  private async checkUserPushCooldown(
    userId: string,
    guildId: string,
  ): Promise<{
    result: number;
    lastPushed: Temporal.Instant;
    cooldownExpires?: Temporal.Duration;
  }> {
    const now = Temporal.Now.instant();
    const oneDayFromNow = now.add({ hours: 24 });

    const result = await this.database
      .select({
        userId: pushcart.userId,
        lastPushed: max(pushcart.timestamp).mapWith((s) =>
          Temporal.Instant.fromEpochMilliseconds(s),
        ),
      })
      .from(pushcart)
      .where(
        and(
          eq(pushcart.userId, userId),
          eq(pushcart.guildId, guildId),
          lte(pushcart.timestamp, oneDayFromNow.epochMilliseconds.toString()),
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
    const secondsSinceLastPushed = lastPushed
      .until(now, {
        smallestUnit: "milliseconds",
      })
      .round({ smallestUnit: "milliseconds" });

    if (secondsSinceLastPushed.seconds < SECONDS_COOLDOWN) {
      const cooldownExpires = lastPushed
        .add({
          seconds: SECONDS_COOLDOWN,
        })
        .until(now, { smallestUnit: "milliseconds" })
        .abs();

      return {
        result: PayloadPushResult.COOLDOWN,
        lastPushed,
        cooldownExpires,
      };
    }

    return { result: PayloadPushResult.SUCCESS, lastPushed };
  }
}
