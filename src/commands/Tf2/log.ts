import { Command, type CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { AttachmentBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";
import { eq } from "drizzle-orm";
import { search } from "@tf2software/logstf";
import { user } from "#root/drizzle/schema.ts";
import PayloadColors from "#utils/colors.ts";
import { Buffer } from "node:buffer";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Log.Description,
  detailedDescription: LanguageKeys.Commands.Log.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const t = await fetchT(interaction);

    const [{ steamId }] = await this.database
      .select({ steamId: user.steamId })
      .from(user)
      .where(eq(user.id, interaction.user.id));

    if (steamId == null) {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: t(LanguageKeys.Commands.Log.NoIdLinked, { user: interaction.user.tag }),
      });
      return;
    }

    const { logs } = await search({ limit: 1, player: [steamId] });

    if (!logs.length) {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: t(LanguageKeys.Commands.Log.NoHistory),
      });
      return;
    }

    const response = await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const logID = logs[0].id;
    const logsUrl = `http://logs.tf/${logID}#${steamId}`;

    const preview = await fetch(
      `${Deno.env.get("PREVIEW_URL")!}/v0/logstf`,
      {
        method: "POST",
        body: JSON.stringify({ url: logsUrl }),
      },
    );

    const arrayBuffer = await preview.arrayBuffer();

    const att = new AttachmentBuilder(Buffer.from(arrayBuffer), {
      name: "log.webp",
    });

    const embed = new EmbedBuilder({
      color: PayloadColors.Command,
      title: t(LanguageKeys.Auto.Logs.EmbedTitle),
      url: logsUrl,
      image: { url: "attachment://log.webp" },
      timestamp: new Date(),
    });

    await response.edit({
      embeds: [embed],
      files: [att],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const rootNameLocalizations = getLocalizedData(LanguageKeys.Commands.Log.Name);
    const rootDescriptionLocalizations = getLocalizedData(this.description);

    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(rootDescriptionLocalizations.localizations["en-US"]!)
        .setDescriptionLocalizations(rootDescriptionLocalizations.localizations)
        .setNameLocalizations(rootNameLocalizations.localizations)
    );
  }
}
