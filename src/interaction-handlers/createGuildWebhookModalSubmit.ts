
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonStyle, codeBlock, ContainerBuilder, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { ButtonBuilder, ModalSubmitInteraction } from 'discord.js';
import { generate } from 'generate-password';
import { LanguageKeys } from '#lib/i18n/all';

export class ModalHandler extends InteractionHandler {
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
    const webhookSecret = generate({ numbers: true, length: 24 });
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

    await interaction.reply({
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
      components: [container],
    });
  }
}
