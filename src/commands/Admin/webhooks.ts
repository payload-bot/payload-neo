import { type CommandOptions, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, codeBlock, InteractionContextType, ChannelType, PermissionFlagsBits } from "discord.js";
import { isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import { LanguageKeys } from "#lib/i18n/all";
import PayloadColors from "#utils/colors";
import { guild, webhook } from "#root/drizzle/schema";
import { eq } from "drizzle-orm";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";
import { generate } from "generate-password";
import { sendTest } from "#lib/api/utils/webhook-helper";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Webhook.Description,
  detailedDescription: LanguageKeys.Commands.Webhook.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const t = await fetchT(interaction);
    const { client } = this.container;

    const [guildWebhook] = await this.database
      .select({ webhookId: guild.webhookId })
      .from(guild)
      .where(eq(guild.id, interaction.guildId));

    switch (interaction.options.getSubcommand(true)) {
      case "add": {
        const channel = interaction.options.getChannel("channel");

        const didSucceed = await sendTest(this.container.client, "channels", channel?.id);

        if (!didSucceed) {
          const embed = new EmbedBuilder({
            author: {
              name: client.user.username,
              iconURL: client.user.displayAvatarURL(),
            },
            title: t(LanguageKeys.Commands.Webhook.EmbedTitle),
            description: t(LanguageKeys.Commands.Webhooks.AddFailed),
            color: PayloadColors.Payload,
          });

          await interaction.reply({ embeds: [embed], ephemeral: true });

          return;
        }

        const secret = generate({ numbers: true, length: 24 });

        const [createdWebhook] = await this.database
          .insert(webhook)
          .values({
            id: interaction.guildId,
            type: "channels",
            value: secret,
          })
          .onConflictDoUpdate({
            set: {
              id: channel.id,
            },
            target: webhook.id,
          })
          .returning();

        await this.database
          .insert(guild)
          .values({
            id: channel.id,
            webhookId: createdWebhook.id,
          })
          .onConflictDoUpdate({
            set: {
              webhookId: createdWebhook.id,
            },
            target: guild.id,
          });

        const embed = new EmbedBuilder({
          title: t(LanguageKeys.Commands.Webhook.EmbedTitle),
          description: codeBlock(createdWebhook.value),
          color: PayloadColors.Payload,
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });

        return;
      }
      case "delete": {
        if (!isNullOrUndefinedOrEmpty(guildWebhook?.webhookId)) {
          const [wbhk] = await this.database
            .select({ id: webhook.id })
            .from(webhook)
            .where(eq(webhook.id, guildWebhook.webhookId));

          await this.container.database.delete(webhook).where(eq(webhook.id, wbhk.id));
        }

        await interaction.reply({
          content: t(LanguageKeys.Commands.Webhook.DeletedWebhook),
          ephemeral: true,
        });

        return;
      }
      case "show": {
        const embed = new EmbedBuilder({
          title: t(LanguageKeys.Commands.Webhook.EmbedTitle),
          description: t(LanguageKeys.Commands.Webhook.NoWebhook),
          color: PayloadColors.Payload,
        });

        if (!isNullOrUndefinedOrEmpty(guildWebhook?.webhookId)) {
          const [wbhk] = await this.database
            .select({ value: webhook.value })
            .from(webhook)
            .where(eq(webhook.id, guildWebhook.webhookId));

          embed.setDescription(codeBlock(wbhk.value));
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });

        return;
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

    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(rootDescriptionLocalizations.localizations["en-US"])
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescriptionLocalizations(rootDescriptionLocalizations.localizations)
        .setNameLocalizations(rootNameLocalizations.localizations)
        .addSubcommand(sub =>
          sub
            .setName("add")
            .setDescription(addDescriptionLocalizations.localizations["en-US"])
            .setNameLocalizations(addNameLocalizations.localizations)
            .setDescriptionLocalizations(addDescriptionLocalizations.localizations)
            .addChannelOption(input =>
              input
                .setName("channel")
                .setDescription(channelIdDescriptionLocalizations.localizations["en-US"])
                .setNameLocalizations(channelIdNameLocalizations.localizations)
                .setDescriptionLocalizations(channelIdDescriptionLocalizations.localizations)
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true),
            ),
        )
        .addSubcommand(sub =>
          sub
            .setName("delete")
            .setDescription(removeDescriptionLocalizations.localizations["en-US"])
            .setNameLocalizations(removeNameLocalizations.localizations)
            .setDescriptionLocalizations(removeDescriptionLocalizations.localizations),
        )
        .addSubcommand(sub =>
          sub
            .setName("show")
            .setDescription(showDescriptionLocalizations.localizations["en-US"])
            .setNameLocalizations(showNameLocalizations.localizations)
            .setDescriptionLocalizations(showDescriptionLocalizations.localizations),
        ),
    );
  }
}
