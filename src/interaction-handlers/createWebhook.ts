import { LanguageKeys } from "#lib/i18n/all";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import { generate } from "generate-password";
import { ActionRowBuilder, ButtonBuilder, type ButtonInteraction, ButtonStyle, codeBlock, ContainerBuilder } from "discord.js";
import { eq } from "drizzle-orm";
import { isNullishOrEmpty, isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { MessageFlags } from "discord.js";
import { TextDisplayBuilder } from "discord.js";
import { webhook } from "../db/schema/webhook.ts";
import { user } from "../db/schema/user.ts";
import { guild } from "#root/db/schema/guild.ts";

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
    if (interaction.customId !== "create-webhook") {
      return this.none();
    }

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const isInUserContext = interaction.guild == null;
    const interactionContextId = interaction.guild ? interaction.guildId : interaction.user.id;

    if (!interactionContextId) {
      return;
    }

    const webhook = await this.#getWebhookByContextId(interactionContextId, isInUserContext);

    if (!isNullOrUndefinedOrEmpty(webhook.secret)) {
      await this.#updateInteractionWithDelete(interaction, webhook.secret);

      return;
    }

    const webhookSecret = isInUserContext ? await this.#generateUserWebhook(interactionContextId) : await this.#generateGuildWebhook(interactionContextId);

    await this.#updateInteractionWithDelete(interaction, webhookSecret);
  }

  async #getWebhookByContextId(contextId: string, isUserDm: boolean) {
    if (isUserDm) {
      const [userWebhook] = await this.database
        .select({ value: webhook.value })
        .from(webhook)
        .where(eq(webhook.id, contextId));

      return userWebhook;
    } else {
      const [{ webhookId }] = await this.database
        .select({ webhookId: guild.webhookId })
        .from(guild)
        .where(eq(guild.id, contextId));

      if (isNullishOrEmpty(webhookId)) {
        return null;
      }

      const [guildWebhook] = await this.database
        .select({ value: webhook.value })
        .from(webhook)
        .where(eq(webhook.id, webhookId!));

      return guildWebhook;
    }
  }

  async #generateUserWebhook(userId: string) {
    const secret = generate({ numbers: true, length: 24 });

    const webhookSecret = await this.container.database.transaction(async (tx) => {
      const [createdWebhook] = await tx
        .insert(webhook)
        .values({
          id: userId,
          type: "users",
          value: secret,
          createdAt: Temporal.Now.instant().epochMilliseconds.toString(),
        })
        .returning();

      if (!createdWebhook) {
        tx.rollback();
      }

      await tx
        .insert(user)
        .values({
          id: userId,
          webhookId: createdWebhook.id,
        })
        .onConflictDoUpdate({
          set: {
            webhookId: createdWebhook.id,
          },
          target: user.id,
        });

      return createdWebhook.value;
    });

    return webhookSecret;
  }

  async #generateGuildWebhook(guildId: string) {
    const secret = generate({ numbers: true, length: 24 })
    // todo: send modal for the text channel
    return secret;
  }
}
