import { Command, type CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, codeBlock, InteractionContextType, MessageFlags, TextDisplayBuilder } from "discord.js";
import { isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";
import { webhook } from "#root/drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";
import { ContainerBuilder } from "discord.js";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Webhook.Description,
  detailedDescription: LanguageKeys.Commands.Webhook.DetailedDescription,
  runIn: [CommandOptionsRunTypeEnum.Dm],
})
export class UserCommand extends PayloadCommand {
  override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const t = await fetchT(interaction);

    const [v] = await this.database
      .select({ value: webhook.value })
      .from(webhook)
      .where(eq(webhook.id, interaction.user.id));

    if (isNullOrUndefinedOrEmpty(v)) {
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

      await interaction.reply({
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        components: [container],
      });
      return;
    }

    const deleteWebhookButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        label: t(LanguageKeys.Commands.Webhook.DeleteWebhook),
        customId: "delete-webhook-for-user",
        style: ButtonStyle.Danger,
      }),
    );

    const description = new TextDisplayBuilder()
      .setContent(t(LanguageKeys.Commands.Webhook.EmbedDescription, { secret: codeBlock(v.value) }));

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
        .setContexts(InteractionContextType.BotDM)
        .setDescriptionLocalizations(descriptionLocalizations.localizations)
        .setNameLocalizations(nameLocalizations.localizations)
    );
  }
}
