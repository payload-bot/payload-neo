import { pushcart } from "#root/db/schema/pushcart.ts";
import { LanguageKeys } from "#root/lib/i18n/all/index.ts";
import PayloadColors from "#root/lib/utils/colors.ts";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { count, countDistinct, desc, eq, sum } from "drizzle-orm";

export class StatsCommand extends Command {
  private readonly database = this.container.database;

  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: LanguageKeys.Commands.Stats.Description,
      detailedDescription: LanguageKeys.Commands.Stats.DetailedDescription,
      runIn: [CommandOptionsRunTypeEnum.GuildText],
    });
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const t = await fetchT(interaction);

    const [{ pushed }] = await this.database
      .select({ pushed: count(pushcart.pushed) })
      .from(pushcart)
      .where(eq(pushcart.guildId, interaction.guildId!));

    if (pushed === 0) {
      return await interaction.reply(t(LanguageKeys.Commands.Stats.NoPushesYet));
    }

    const [{ totalPushed, totalUnitsPushed, distinctPushers }] = await this.database
      .select({
        totalPushed: count(pushcart.pushed),
        totalUnitsPushed: sum(pushcart.pushed).mapWith(Number),
        distinctPushers: countDistinct(pushcart.userId),
      })
      .from(pushcart)
      .where(eq(pushcart.guildId, interaction.guildId!));

    const userStatisticsQuery = await this.database
      .select({
        userId: pushcart.userId,
        count: count(pushcart.pushed),
        sum: sum(pushcart.pushed).mapWith(Number),
      })
      .from(pushcart)
      .where(eq(pushcart.guildId, interaction.guildId!))
      .groupBy(pushcart.userId)
      .orderBy(desc(pushcart.userId))
      .limit(5);

    const userIdsToFetch = userStatisticsQuery.map((query) => query.userId);

    const userMap = await interaction.guild!.members.fetch({ user: userIdsToFetch });

    const topFiveSortedPushers = userStatisticsQuery.sort((a, b) => b.count - a.count);
    const topFiveSummedPushers = userStatisticsQuery.sort((a, b) => b.sum - a.sum);

    const activePushersLeaderboard = topFiveSortedPushers.map(({ count, userId }, index) => {
      const member = userMap.get(userId);

      const name = member?.toString() ?? "N/A";

      const nameToDisplay = interaction.user.id === userId ? name : name;

      return t(LanguageKeys.Commands.Stats.RankString, {
        name: nameToDisplay,
        rank: index + 1,
        count: count ?? 0,
      });
    });

    const topPushersLeaderboard = topFiveSummedPushers.map(({ userId, sum }, index) => {
      const member = userMap.get(userId);

      const name = member?.toString() ?? "N/A";

      const nameToDisplay = interaction.user.id === userId ? name : name;

      return t(LanguageKeys.Commands.Stats.RankString, {
        name: nameToDisplay,
        rank: index + 1,
        count: sum ?? 0,
      });
    });

    const embed = new EmbedBuilder()
      .setColor(PayloadColors.Payload)
      .setTitle(t(LanguageKeys.Commands.Stats.StatsTitle, { name: interaction.guild!.name }))
      .addFields(
        {
          name: t(LanguageKeys.Commands.Stats.TotalUnitsPushedTitle),
          value: t(LanguageKeys.Commands.Stats.TotalUnitsPushed, {
            count: totalUnitsPushed,
          }),
          inline: true,
        },
        {
          name: t(LanguageKeys.Commands.Stats.TotalPushedTitle),
          value: t(LanguageKeys.Commands.Stats.TotalPushed, {
            count: totalPushed,
          }),
          inline: true,
        },
        {
          name: t(LanguageKeys.Commands.Stats.DistinctPushersTitle),
          value: t(LanguageKeys.Commands.Stats.DistinctPushers, {
            count: distinctPushers,
          }),
          inline: true,
        },
      )
      .addFields(
        {
          name: t(LanguageKeys.Commands.Stats.TopPushers),
          value: topPushersLeaderboard.join("\n"),
          inline: true,
        },
        {
          name: t(LanguageKeys.Commands.Stats.ActivePushers),
          value: activePushersLeaderboard.join("\n"),
          inline: true,
        },
      );

    return await interaction.reply({ embeds: [embed], allowedMentions: { users: [] } });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const rootNameLocalizations = getLocalizedData(LanguageKeys.Commands.Stats.Name);
    const rootDescriptionLocalizations = getLocalizedData(this.description);

    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(rootDescriptionLocalizations.localizations["en-US"]!)
        .setDescriptionLocalizations(rootDescriptionLocalizations.localizations)
        .setNameLocalizations(rootNameLocalizations.localizations),
    );
  }
}
