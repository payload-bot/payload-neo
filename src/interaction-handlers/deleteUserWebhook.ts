import { LanguageKeys } from "#lib/i18n/all";
import { webhook } from "#root/drizzle/schema.ts";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import { ActionRowBuilder, ButtonBuilder, type ButtonInteraction, ButtonStyle, ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
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

    const createWebhookButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        label: t(LanguageKeys.Commands.Webhook.CreateWebhook),
        customId: "create-webhook-for-user",
        style: ButtonStyle.Primary,
      }),
    );

    const description = new TextDisplayBuilder()
      .setContent(t(LanguageKeys.Commands.Webhook.NoWebhook));

    const container = new ContainerBuilder()
      .addTextDisplayComponents(description)
      .addActionRowComponents(createWebhookButton);

    await this.container.database.delete(webhook)
      .where(eq(webhook.id, interaction.user.id));

    await interaction.update({
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
      components: [container],
    });
  }
}
