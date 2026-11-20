import { Command } from "@sapphire/framework";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, codeBlock, InteractionContextType, MessageFlags, PermissionFlagsBits, TextDisplayBuilder } from "discord.js";
import { isNullishOrEmpty } from "@sapphire/utilities";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";
import { eq } from "drizzle-orm";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";
import { ContainerBuilder } from "discord.js";
import { webhook } from "../../db/schema/webhook.ts";
import { guild } from "#root/db/schema/guild.ts";

export class UserCommand extends PayloadCommand {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: LanguageKeys.Commands.Webhook.Description,
      detailedDescription: LanguageKeys.Commands.Webhook.DetailedDescription,
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const t = await fetchT(interaction);
    const interactionContextId = interaction.guild ? interaction.guildId : interaction.user.id;

    if (!interactionContextId) {
      return;
    }

    const webhook = await this.#getWebhookByContextId(interactionContextId, interaction.guild == null);

    if (isNullishOrEmpty(webhook)) {
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

      await interaction.reply({
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        components: [container],
      });
      return;
    }

    const deleteWebhookButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        label: t(LanguageKeys.Commands.Webhook.DeleteWebhook),
        customId: "delete-webhook",
        style: ButtonStyle.Danger,
      }),
    );

    const description = new TextDisplayBuilder()
      .setContent(t(LanguageKeys.Commands.Webhook.EmbedDescription, { secret: codeBlock(webhook.value) }));

    const container = new ContainerBuilder()
      .addTextDisplayComponents(description)
      .addActionRowComponents(deleteWebhookButton);

    await interaction.reply({
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
      components: [container],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const descriptionLocalizations = getLocalizedData(this.description);
    const nameLocalizations = getLocalizedData(LanguageKeys.Commands.Webhook.Name);

    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(descriptionLocalizations.localizations["en-US"]!)
        .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild])
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDescriptionLocalizations(descriptionLocalizations.localizations)
        .setNameLocalizations(nameLocalizations.localizations)
    );
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
}
