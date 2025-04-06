import { CommandOptionsRunTypeEnum, type CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  EmbedBuilder,
  codeBlock,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType,
} from "discord.js";
import { isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";
import PayloadColors from "#utils/colors.ts";
import { webhook } from "#root/drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Webhook.Description,
  detailedDescription: LanguageKeys.Commands.Webhook.DetailedDescription,
  runIn: [CommandOptionsRunTypeEnum.Dm],
})
export class UserCommand extends PayloadCommand {
  override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const t = await fetchT(interaction);
    const { client } = this.container;

    const [v] = await this.database
      .select({ value: webhook.value })
      .from(webhook)
      .where(eq(webhook.id, interaction.user.id));

    if (isNullOrUndefinedOrEmpty(v)) {
      const embed = new EmbedBuilder({
        title: t(LanguageKeys.Commands.Webhook.EmbedTitle),
        description: t(LanguageKeys.Commands.Webhook.NoWebhook),
        color: PayloadColors.Payload,
      });

      const createWebhookButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder({
          label: t(LanguageKeys.Commands.Webhook.CreateWebhook),
          customId: "create-webhook-for-user",
          style: ButtonStyle.Primary,
        }),
      );

      await interaction.reply({ embeds: [embed], components: [createWebhookButton], ephemeral: true });
      return;
    }

    const deleteWebhookButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        label: t(LanguageKeys.Commands.Webhook.DeleteWebhook),
        customId: "delete-webhook-for-user",
        style: ButtonStyle.Danger,
      }),
    );

    const embed = new EmbedBuilder({
      author: {
        name: client.user!.username,
        iconURL: client.user!.displayAvatarURL(),
      },
      title: t(LanguageKeys.Commands.Webhook.EmbedTitle),
      description: codeBlock(v.value),
      color: PayloadColors.Payload,
    });

    await interaction.reply({ embeds: [embed], components: [deleteWebhookButton], ephemeral: true });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const descriptionLocalizations = getLocalizedData(this.description);
    const nameLocalizations = getLocalizedData(LanguageKeys.Commands.Webhook.Name);

    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(descriptionLocalizations.localizations["en-US"])
        .setContexts(InteractionContextType.BotDM)
        .setDescriptionLocalizations(descriptionLocalizations.localizations)
        .setNameLocalizations(nameLocalizations.localizations),
    );
  }
}
