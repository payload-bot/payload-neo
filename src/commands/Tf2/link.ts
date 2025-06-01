import type { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { getSteamIdFromArgs } from "#utils/getSteamId.ts";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";
import { eq } from "drizzle-orm";
import { user } from "#root/drizzle/schema.ts";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";
import { MessageFlags } from "discord-api-types/v10";
import { isNullishOrEmpty } from "@sapphire/utilities";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Link.Description,
  detailedDescription: LanguageKeys.Commands.Link.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
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

    await this.database
      .update(user)
      .set({ steamId })
      .where(eq(user.id, interaction.user.id));

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: t(LanguageKeys.Commands.Link.Success, { steamId: testResult }),
    });

    return;
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const rootNameLocalizations = getLocalizedData(LanguageKeys.Commands.Link.Name);
    const rootDescriptionLocalizations = getLocalizedData(this.description);

    const steamIdNameLocalizations = getLocalizedData(LanguageKeys.Commands.Link.SteamIdName);
    const steamIdDescriptionLocalizations = getLocalizedData(LanguageKeys.Commands.Link.SteamIdDescription);

    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(rootDescriptionLocalizations.localizations["en-US"]!)
        .setDescriptionLocalizations(rootDescriptionLocalizations.localizations)
        .setNameLocalizations(rootNameLocalizations.localizations)
        .addStringOption(
          (input) =>
            input
              .setName("steam-id")
              .setDescription(steamIdNameLocalizations.localizations["en-US"]!)
              .setRequired(true)
              .setNameLocalizations(steamIdNameLocalizations.localizations)
              .setDescriptionLocalizations(steamIdDescriptionLocalizations.localizations),
        )
    );
  }
}
