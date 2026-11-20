import { LanguageKeys } from "#lib/i18n/all";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import { ActionRowBuilder, ButtonBuilder, type ButtonInteraction, ButtonStyle, ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { eq } from "drizzle-orm";
import { webhook } from "../db/schema/webhook.ts";
import { isNullishOrEmpty } from "@sapphire/utilities";
import { guild } from "#root/db/schema/guild.ts";

export class ButtonHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "delete-webhook") {
      return this.none();
    }

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const t = await fetchT(interaction);
    const isInUserContext = interaction.guild == null;
    const interactionContextId = interaction.guild ? interaction.guildId : interaction.user.id;

    if (!interactionContextId) {
      return;
    }

    const createWebhookButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        label: t(LanguageKeys.Commands.Webhook.CreateWebhook),
        customId: "create-webhook",
        style: ButtonStyle.Primary,
      }),
    );

    const description = new TextDisplayBuilder()
      .setContent(t(LanguageKeys.Commands.Webhook.NoWebhook));

    const container = new ContainerBuilder()
      .addTextDisplayComponents(description)
      .addActionRowComponents(createWebhookButton);

    await this.#deleteWebhook(interactionContextId, isInUserContext);

    await interaction.update({
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
      components: [container],
    });
  }

  async #deleteWebhook(contextId: string, isUser: boolean) {
    if (isUser) {
      await this.container.database.delete(webhook)
        .where(eq(webhook.id, contextId));
    } else {
      const [guildWebhook] = await this.container.database
        .select({ webhookId: guild.webhookId })
        .from(guild)
        .where(eq(guild.id, contextId));

      if (isNullishOrEmpty(guildWebhook)) {
        return;
      }

      await this.container.database.delete(webhook).where(
        eq(webhook.id, guildWebhook.webhookId!),
      );
    }
  }
}
