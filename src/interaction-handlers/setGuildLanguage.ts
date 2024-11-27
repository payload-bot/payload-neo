import { LanguageKeys } from "#lib/i18n/all/index";
import { guild } from "#root/drizzle/schema";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import { isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { inlineCode, type ButtonInteraction, type StringSelectMenuInteraction } from "discord.js";

export class ButtonHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.SelectMenu,
    });
  }

  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "set-guild-language") {
      return this.none();
    }

    return this.some();
  }

  public async run(interaction: StringSelectMenuInteraction) {
    const t = await fetchT(interaction);
    const value = interaction.values[0];

    if (isNullOrUndefinedOrEmpty(value)) {
      return;
    }

    await this.container.database
      .insert(guild)
      .values({
        id: interaction.guildId,
        language: value,
      })
      .onConflictDoUpdate({
        set: {
          language: value,
        },
        target: guild.id,
      });

    await interaction.reply({
      content: t(LanguageKeys.Commands.Language.SetLanguage, { language: inlineCode(value) }),
      ephemeral: true,
    });
  }
}
