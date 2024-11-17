import { LanguageKeys } from "#lib/i18n/all/index";
import { webhook } from "#root/drizzle/schema";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import type { ButtonInteraction } from "discord.js";
import { eq } from "drizzle-orm";

export class ButtonHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "delete-webhook-for-user") {
      return this.none();
    }

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const t = await fetchT(interaction);

    await this.container.database.delete(webhook).where(eq(webhook.id, interaction.user.id));

    await interaction.reply({
      content: t(LanguageKeys.Commands.Webhook.DeletedWebhook),
      ephemeral: true,
    });
  }
}
