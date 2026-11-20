
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonStyle, ChannelType, codeBlock, ContainerBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits, TextDisplayBuilder } from 'discord.js';
import { ButtonBuilder, ModalSubmitInteraction } from 'discord.js';
import { generate } from 'generate-password';
import { LanguageKeys } from '#lib/i18n/all';
import PayloadColors from '#root/lib/utils/colors.ts';
import { webhook } from '#root/db/schema/webhook.ts';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { guild } from '#root/db/schema/guild.ts';

export class CreateGuildWebhookModalSubmitHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit
    });
  }

  public override parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== 'create-guild-webhook') {
      return this.none();
    }

    return this.some();
  }

  public async run(interaction: ModalSubmitInteraction) {
    const webhookSecret = await this.#addWebhook(interaction);
    await this.#updateInteractionWithDelete(interaction, webhookSecret);
  }

  async #updateInteractionWithDelete(interaction: ModalSubmitInteraction, webhookSecret: string) {
    const t = await fetchT(interaction);

    const deleteWebhookButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        label: t(LanguageKeys.Commands.Webhook.DeleteWebhook),
        customId: "delete-webhook",
        style: ButtonStyle.Danger,
      }),
    );

    const description = new TextDisplayBuilder()
      .setContent(t(LanguageKeys.Commands.Webhook.EmbedDescription, { secret: codeBlock(webhookSecret) }));

    const container = new ContainerBuilder()
      .addTextDisplayComponents(description)
      .addActionRowComponents(deleteWebhookButton);

    if (interaction.isFromMessage()) {
      await interaction.update({
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        components: [container],
      });
    } else {
      await interaction.reply({
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        components: [container],
      });
    }
  }

  async #addWebhook(interaction: ModalSubmitInteraction) {
    const t = await fetchT(interaction);
    const channelOptions = interaction.fields.getSelectedChannels("channelId", true, [ChannelType.GuildText]);
    const channel = channelOptions.first();

    if (isNullishOrEmpty(channel)) {
      const embed = new EmbedBuilder({
        title: t(LanguageKeys.Commands.Webhook.EmbedTitle),
        description: t(LanguageKeys.Commands.Webhook.WebhookFailedCreate),
        color: PayloadColors.Payload,
      });

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

      return;
    }

    const hasPermissionToSendMessages = channel?.appPermissions?.has(PermissionFlagsBits.SendMessages);

    if (!hasPermissionToSendMessages) {
      const embed = new EmbedBuilder({
        title: t(LanguageKeys.Commands.Webhook.EmbedTitle),
        description: t(LanguageKeys.Commands.Webhook.WebhookFailedCreate),
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

    return webhookSecret;
  }
}
