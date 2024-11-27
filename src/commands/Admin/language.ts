import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, InteractionContextType, StringSelectMenuBuilder, ActionRowBuilder } from "discord.js";
import PayloadColors from "#utils/colors";
import { inlineCode } from "@discordjs/builders";
import { LanguageKeys } from "#lib/i18n/all";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { guild } from "#root/drizzle/schema";
import { eq } from "drizzle-orm";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";

@ApplyOptions<Subcommand.Options>({
  description: LanguageKeys.Commands.Language.Description,
  detailedDescription: LanguageKeys.Commands.Language.DetailedDescription,
  runIn: [CommandOptionsRunTypeEnum.GuildText],
})
export class UserCommand extends PayloadCommand {
  async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const t = await fetchT(interaction);

    const [g] = await this.database
      .select({ language: guild.language })
      .from(guild)
      .where(eq(guild.id, interaction.guildId));

    const languageSelector = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .addOptions(
          { label: t(LanguageKeys.Commands.Language.English), value: "en-US" },
          { label: t(LanguageKeys.Commands.Language.Spanish), value: "es-ES" },
          { label: t(LanguageKeys.Commands.Language.German), value: "de" },
          { label: t(LanguageKeys.Commands.Language.Finnish), value: "fi" },
          { label: t(LanguageKeys.Commands.Language.French), value: "fr" },
          { label: t(LanguageKeys.Commands.Language.Russian), value: "ru" },
          { label: t(LanguageKeys.Commands.Language.Polish), value: "pl" },
        )
        .setCustomId("set-guild-language")
        .setPlaceholder(t(LanguageKeys.Commands.Language.SelectLanguage)),
    );

    const embed = new EmbedBuilder({
      title: t(LanguageKeys.Commands.Language.SelectLanguage),
      description: t(LanguageKeys.Commands.Language.CurrentLanguage, {
        language: inlineCode(g?.language ?? "en-US"),
      }),
      timestamp: new Date(),
      color: PayloadColors.Admin,
    });

    await interaction.reply({
      embeds: [embed],
      components: [languageSelector],
      ephemeral: true,
    });

    return;
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const rootNameLocalizations = getLocalizedData(LanguageKeys.Commands.Language.Name);
    const rootDescriptionLocalizations = getLocalizedData(this.description);

    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(rootDescriptionLocalizations.localizations["en-US"])
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescriptionLocalizations(rootDescriptionLocalizations.localizations)
        .setNameLocalizations(rootNameLocalizations.localizations),
    );
  }
}
