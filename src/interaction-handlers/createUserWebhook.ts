import { LanguageKeys } from "#lib/i18n/all";
import { user, webhook } from "#root/drizzle/schema.ts";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import { generate } from "generate-password";
import { ActionRowBuilder, ButtonBuilder, type ButtonInteraction, ButtonStyle, codeBlock, ContainerBuilder } from "discord.js";
import { eq } from "drizzle-orm";
import { isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { MessageFlags } from "discord.js";
import { TextDisplayBuilder } from "discord.js";

export class ButtonHandler extends InteractionHandler {
  public constructor(
    ctx: InteractionHandler.LoaderContext,
    options: InteractionHandler.Options,
  ) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  async #updateInteractionWithDelete(interaction: ButtonInteraction, webhookSecret: string) {
    const t = await fetchT(interaction);

    const deleteWebhookButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        label: t(LanguageKeys.Commands.Webhook.DeleteWebhook),
        customId: "delete-webhook-for-user",
        style: ButtonStyle.Danger,
      }),
    );

    const description = new TextDisplayBuilder()
      .setContent(t(LanguageKeys.Commands.Webhook.EmbedDescription, { secret: codeBlock(webhookSecret) }));

    const container = new ContainerBuilder()
      .addTextDisplayComponents(description)
      .addActionRowComponents(deleteWebhookButton);

    await interaction.update({
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
      components: [container],
    });
  }

  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "create-webhook-for-user") {
      return this.none();
    }

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const [userWebhook] = await this.container.database
      .select({ secret: webhook.value })
      .from(webhook)
      .where(eq(webhook.id, interaction.user.id));

    if (!isNullOrUndefinedOrEmpty(userWebhook?.secret)) {
      await this.#updateInteractionWithDelete(interaction, userWebhook.secret);

      return;
    }

    const secret = generate({ numbers: true, length: 24 });

    const [createdWebhook] = await this.container.database
      .insert(webhook)
      .values({
        id: interaction.user.id,
        type: "users",
        value: secret,
        createdAt: Temporal.Now.instant().epochMilliseconds.toString(),
      })
      .returning();

    await this.container.database
      .insert(user)
      .values({
        id: interaction.user.id,
        webhookId: createdWebhook.id,
      })
      .onConflictDoUpdate({
        set: {
          webhookId: createdWebhook.id,
        },
        target: user.id,
      });

    await this.#updateInteractionWithDelete(interaction, createdWebhook.value);
  }
}
