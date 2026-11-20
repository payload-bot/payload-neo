import { pushcart } from "#root/db/schema/pushcart.ts";
import { LanguageKeys } from "#root/lib/i18n/all/index.ts";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";
import { isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { ChatInputCommandInteraction, codeBlock, escapeMarkdown, GuildMember } from "discord.js";
import { sum, eq, sql } from "drizzle-orm";

export class RankCommand extends Command {
  private readonly database = this.container.database;
  private readonly t = async (interaction: ChatInputCommandInteraction) => await fetchT(interaction);

  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options, description: LanguageKeys.Commands.Rank.Description, detailedDescription: LanguageKeys.Commands.Rank.DetailedDescription, runIn: [CommandOptionsRunTypeEnum.GuildText] });
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const t = await fetchT(interaction);
    const targetUser = interaction.user;

    const [data] = await this.database
      .select({
        sum: sum(pushcart.pushed).mapWith(Number).as("sum"),
        rank: sql`ROW_NUMBER() OVER (ORDER BY pushed DESC)`.mapWith(Number).as(
          "rank",
        ),
        userId: pushcart.userId,
      })
      .from(pushcart)
      .where(eq(pushcart.guildId, interaction.guildId!))
      .groupBy(pushcart.userId);

    let memberNameToDisplay = targetUser instanceof GuildMember ? (targetUser.nickname ?? targetUser.displayName) : targetUser.username;

    memberNameToDisplay ??= "N/A";

    if (isNullOrUndefinedOrEmpty(data)) {
      return await interaction.reply(
        t(LanguageKeys.Commands.Rank.RankString, {
          name: escapeMarkdown(memberNameToDisplay),
          count: 0,
        }),
      );
    }

    return await interaction.reply(
      codeBlock(
        "md",
        t(LanguageKeys.Commands.Rank.RankString, {
          name: memberNameToDisplay,
          rank: data?.rank ?? "-",
          count: data?.sum ?? 0,
        }),
      ),
    );
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const rootNameLocalizations = getLocalizedData(LanguageKeys.Commands.Rank.Name);
    const rootDescriptionLocalizations = getLocalizedData(this.description);

    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(rootDescriptionLocalizations.localizations["en-US"]!)
        .setDescriptionLocalizations(rootDescriptionLocalizations.localizations)
        .setNameLocalizations(rootNameLocalizations.localizations)
    );
  }
}
