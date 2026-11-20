import { Command } from "@sapphire/framework";
import { ChannelType, ChatInputCommandInteraction, codeBlock, EmbedBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits } from "discord.js";
import { isNullishOrEmpty } from "@sapphire/utilities";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";
import PayloadColors from "#utils/colors.ts";
import { eq } from "drizzle-orm";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";
import { generate } from "generate-password";
import { sendTest } from "#utils/webhook-helper.ts";
import { guild } from "../../db/schema/guild.ts";
import { webhook } from "#root/db/schema/webhook.ts";

export class GuildWebhookCommand extends PayloadCommand {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: LanguageKeys.Commands.Webhook.Description,
      detailedDescription: LanguageKeys.Commands.Webhook.DetailedDescription,
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    switch (interaction.options.getSubcommand(true)) {
      case "add": {
        return await this.#addWebhook(interaction);
      }
      case "delete": {
        return await this.#removeWebhook(interaction);
      }
      case "show": {
        return await this.#showWebhook(interaction);
      }
    }
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const rootNameLocalizations = getLocalizedData(LanguageKeys.Commands.Webhooks.Name);
    const rootDescriptionLocalizations = getLocalizedData(this.description);

    const addNameLocalizations = getLocalizedData(LanguageKeys.Commands.Webhooks.AddName);
    const addDescriptionLocalizations = getLocalizedData(LanguageKeys.Commands.Webhooks.AddDescription);
    const channelIdNameLocalizations = getLocalizedData(LanguageKeys.Commands.Webhooks.AddChannelIdName);
    const channelIdDescriptionLocalizations = getLocalizedData(LanguageKeys.Commands.Webhooks.AddChannelIdDescription);

    const removeNameLocalizations = getLocalizedData(LanguageKeys.Commands.Webhooks.RemoveName);
    const removeDescriptionLocalizations = getLocalizedData(LanguageKeys.Commands.Webhooks.RemoveDescription);

    const showNameLocalizations = getLocalizedData(LanguageKeys.Commands.Webhooks.ShowName);
    const showDescriptionLocalizations = getLocalizedData(LanguageKeys.Commands.Webhooks.ShowDescription);

    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(rootDescriptionLocalizations.localizations["en-US"]!)
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescriptionLocalizations(rootDescriptionLocalizations.localizations)
        .setNameLocalizations(rootNameLocalizations.localizations)
        .addSubcommand((sub) =>
          sub
            .setName("add")
            .setDescription(addDescriptionLocalizations.localizations["en-US"]!)
            .setNameLocalizations(addNameLocalizations.localizations)
            .setDescriptionLocalizations(addDescriptionLocalizations.localizations)
            .addChannelOption((input) =>
              input
                .setName("channel")
                .setDescription(channelIdDescriptionLocalizations.localizations["en-US"]!)
                .setNameLocalizations(channelIdNameLocalizations.localizations)
                .setDescriptionLocalizations(channelIdDescriptionLocalizations.localizations)
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("delete")
            .setDescription(removeDescriptionLocalizations.localizations["en-US"]!)
            .setNameLocalizations(removeNameLocalizations.localizations)
            .setDescriptionLocalizations(removeDescriptionLocalizations.localizations)
        )
        .addSubcommand((sub) =>
          sub
            .setName("show")
            .setDescription(showDescriptionLocalizations.localizations["en-US"]!)
            .setNameLocalizations(showNameLocalizations.localizations)
            .setDescriptionLocalizations(showDescriptionLocalizations.localizations)
        )
    );
  }

  async #addWebhook(interaction: ChatInputCommandInteraction) {
    const t = await fetchT(interaction);
    const channel = interaction.options.getChannel("channel");

    if (channel == null) {
      const embed = new EmbedBuilder({
        title: t(LanguageKeys.Commands.Webhook.EmbedTitle),
        description: t(LanguageKeys.Commands.Webhooks.AddFailed),
        color: PayloadColors.Payload,
      });

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

      return;
    }

    const didSucceed = await sendTest(
      this.container.client,
      "channels",
      channel?.id,
    );

    if (!didSucceed) {
      const embed = new EmbedBuilder({
        title: t(LanguageKeys.Commands.Webhook.EmbedTitle),
        description: t(LanguageKeys.Commands.Webhooks.AddFailed),
        color: PayloadColors.Payload,
      });

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

      return;
    }

    const secret = generate({ numbers: true, length: 24 });

    const webhookSecret = await this.container.database.transaction(async (tx) => {
      const [createdWebhook] = await tx
        .insert(webhook)
        .values({
          id: channel.id,
          type: "channels",
          value: secret,
          createdAt: Temporal.Now.instant().epochMilliseconds.toString(),
        })
        .onConflictDoUpdate({
          set: {
            id: channel.id,
          },
          target: webhook.id,
        })
        .returning();

      if (isNullishOrEmpty(createdWebhook)) {
        tx.rollback();
      }

      await tx
        .insert(guild)
        .values({
          id: interaction.guildId!,
          webhookId: createdWebhook!.id,
        })
        .onConflictDoUpdate({
          set: {
            webhookId: createdWebhook!.id,
          },
          target: guild.id,
        });

      return createdWebhook!.value;
    });

    const embed = new EmbedBuilder({
      title: t(LanguageKeys.Commands.Webhook.EmbedTitle),
      description: codeBlock(webhookSecret),
      color: PayloadColors.Payload,
    });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    return;
  }

  async #removeWebhook(interaction: ChatInputCommandInteraction) {
    const t = await fetchT(interaction);

    const [guildWebhook] = await this.database
      .select({ webhookId: guild.webhookId })
      .from(guild)
      .where(eq(guild.id, interaction.guildId!));

    if (!isNullishOrEmpty(guildWebhook?.webhookId)) {
      const [wbhk] = await this.database
        .select({ id: webhook.id })
        .from(webhook)
        .where(eq(webhook.id, guildWebhook!.webhookId));

      await this.container.database.delete(webhook).where(
        eq(webhook.id, wbhk.id),
      );
    }

    await interaction.reply({
      content: t(LanguageKeys.Commands.Webhook.DeletedWebhook),
      flags: MessageFlags.Ephemeral
    });

    return;
  }

  async #showWebhook(interaction: ChatInputCommandInteraction) {
    const t = await fetchT(interaction);

    const [guildWebhook] = await this.database
      .select({ webhookId: guild.webhookId })
      .from(guild)
      .where(eq(guild.id, interaction.guildId!));

    const embed = new EmbedBuilder({
      title: t(LanguageKeys.Commands.Webhook.EmbedTitle),
      description: t(LanguageKeys.Commands.Webhook.NoWebhook),
      color: PayloadColors.Payload,
    });

    if (!isNullishOrEmpty(guildWebhook?.webhookId)) {
      const [wbhk] = await this.database
        .select({ value: webhook.value })
        .from(webhook)
        .where(eq(webhook.id, guildWebhook!.webhookId));

      embed.setDescription(t(LanguageKeys.Commands.Webhook.EmbedDescription, { secret: codeBlock(wbhk.value) }));
    }

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    return;
  }
}
