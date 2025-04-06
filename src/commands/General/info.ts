import type { Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder } from "discord.js";
import { PayloadCommand } from "#lib/structs/commands/PayloadCommand.ts";
import { LanguageKeys } from "#lib/i18n/all";
import PayloadColors from "#utils/colors.ts";
import { fetchT, getLocalizedData } from "@sapphire/plugin-i18next";

@ApplyOptions<CommandOptions>({
  description: LanguageKeys.Commands.Info.Description,
  detailedDescription: LanguageKeys.Commands.Info.DetailedDescription,
})
export class UserCommand extends PayloadCommand {
  async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { client } = this.container;
    const t = await fetchT(interaction);

    const membersServing = client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0);

    const guildsServing = client.guilds.cache.size;

    const embed = new EmbedBuilder({
      author: {
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      },
      title: t(LanguageKeys.Commands.Info.EmbedTitle, {
        users: membersServing,
        servers: guildsServing,
      }),
      description: t(LanguageKeys.Commands.Info.EmbedDescription),
      color: PayloadColors.Payload,
    });

    await interaction.reply({ embeds: [embed] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    const rootNameLocalizations = getLocalizedData(LanguageKeys.Commands.Info.Name);
    const rootDescriptionLocalizations = getLocalizedData(this.description);

    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(rootDescriptionLocalizations.localizations["en-US"])
        .setDescriptionLocalizations(rootDescriptionLocalizations.localizations)
        .setNameLocalizations(rootNameLocalizations.localizations),
    );
  }
}
