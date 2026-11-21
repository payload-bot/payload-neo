import type { Command } from "@sapphire/framework";
import { getSteamIdFromArgs } from "#utils/getSteamId.ts";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";
import { eq } from "drizzle-orm";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";
import { isNullishOrEmpty } from "@sapphire/utilities";
import { user } from "../../db/schema/user.ts";
import { MessageFlags } from "discord.js";

export class UserCommand extends PayloadCommand {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: LanguageKeys.Commands.Link.Description,
      detailedDescription: LanguageKeys.Commands.Link.DetailedDescription,
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const t = await fetchT(interaction);
    const steamId = interaction.options.getString("steam-id")?.trim();

    if (isNullishOrEmpty(steamId)) {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: t(LanguageKeys.Commands.Link.MissingId),
      });

      return;
    }

    const testResult = await getSteamIdFromArgs(steamId);

    if (testResult === null) {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: t(LanguageKeys.Commands.Link.MalformedId),
      });

      return;
    }

    await this.database.update(user).set({ steamId }).where(eq(user.id, interaction.user.id));

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: t(LanguageKeys.Commands.Link.Success, { steamId: testResult.get64() }),
    });

    return;
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const rootNameLocalizations = getLocalizedData(LanguageKeys.Commands.Link.Name);
    const rootDescriptionLocalizations = getLocalizedData(this.description);

    const steamIdNameLocalizations = getLocalizedData(LanguageKeys.Commands.Link.SteamIdName);
    const steamIdDescriptionLocalizations = getLocalizedData(
      LanguageKeys.Commands.Link.SteamIdDescription,
    );

    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(rootDescriptionLocalizations.localizations["en-US"]!)
        .setDescriptionLocalizations(rootDescriptionLocalizations.localizations)
        .setNameLocalizations(rootNameLocalizations.localizations)
        .addStringOption((input) =>
          input
            .setName("steam-id")
            .setDescription(steamIdNameLocalizations.localizations["en-US"]!)
            .setRequired(true)
            .setNameLocalizations(steamIdNameLocalizations.localizations)
            .setDescriptionLocalizations(steamIdDescriptionLocalizations.localizations),
        ),
    );
  }
}
