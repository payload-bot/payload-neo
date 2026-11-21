import { pushcart } from "#root/db/schema/pushcart.ts";
import { LanguageKeys } from "#root/lib/i18n/all/index.ts";
import PayloadColors from "#root/lib/utils/colors.ts";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";
import { chunk } from "@sapphire/utilities";
import {
  EmbedBuilder,
  Colors,
  escapeMarkdown,
  codeBlock,
  ChatInputCommandInteraction,
} from "discord.js";
import { sum, eq } from "drizzle-orm";

export class LeaderboardCommand extends Command {
  private readonly database = this.container.database;

  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: LanguageKeys.Commands.Leaderboard.Description,
      detailedDescription: LanguageKeys.Commands.Leaderboard.DetailedDescription,
      runIn: [CommandOptionsRunTypeEnum.GuildText],
    });
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const loadingEmbed = new EmbedBuilder().setDescription("Loading...").setColor(Colors.Gold);

    const t = await fetchT(interaction);

    const paginationEmbed = new PaginatedMessage({
      template: new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(t(LanguageKeys.Commands.Leaderboard.LeaderboardEmbedTitle)),
    });

    const userLeaderboard = await this.database
      .select({
        userId: pushcart.userId,
        pushed: sum(pushcart.pushed).mapWith(Number),
      })
      .from(pushcart)
      .where(eq(pushcart.guildId, interaction.guildId!))
      .groupBy(pushcart.userId, pushcart.guildId);

    if (userLeaderboard.length === 0) {
      return;
    }

    const userIdsToFetch = userLeaderboard.map((x) => x.userId);
    const userMap = await interaction.guild!.members.fetch({ user: userIdsToFetch });

    const CHUNK_AMOUNT = 5;

    const sorted = userLeaderboard.sort((a, b) => b.pushed - a.pushed);

    for (const page of chunk(sorted, CHUNK_AMOUNT)) {
      const leaderboardString = page.map(({ userId, pushed }, index) => {
        const user = userMap.get(userId) ?? null;

        return interaction.user.id === userId
          ? `> ${index + 1}: ${escapeMarkdown(user?.user.username ?? "N/A")} (${pushed})`
          : `${index + 1}: ${escapeMarkdown(user?.user.username ?? "N/A")} (${pushed})`;
      });

      const embed = new EmbedBuilder({
        title: t(LanguageKeys.Commands.Leaderboard.LeaderboardEmbedTitle),
        description: codeBlock("md", leaderboardString.join("\n")),
        color: PayloadColors.User,
      });

      paginationEmbed.addPageEmbed(embed);
    }

    const response = await interaction.reply({ embeds: [loadingEmbed], withResponse: true });

    await paginationEmbed.run(response.resource!.message!, interaction.user);

    return response;
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const rootNameLocalizations = getLocalizedData(LanguageKeys.Commands.Leaderboard.Name);
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
