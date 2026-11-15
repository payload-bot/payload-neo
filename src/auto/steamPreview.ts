import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Message, MessageActionRowComponentBuilder, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";
import { MessageFlags } from "discord.js";
import { getSteamIdFromUrl } from "#utils/getSteamId.ts";
import { getSteamProfileInformation } from "#utils/getSteamInformation.ts";
import { isNullish } from "@sapphire/utilities";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Logs.Description,
  regex: /http(s|):\/\/(www\.|)steamcommunity\.com\/id\/\w+/,
})
export default class SteamPreviewCommand extends AutoCommand {
  // @ts-ignore have to do this
  async messageRun(msg: Message, args: AutoCommand.Args, { matched }: AutoCommand.Context) {
    const steamId = await getSteamIdFromUrl(matched);

    if (isNullish(steamId)) {
      return;
    }

    const guildLocale = msg.guild?.preferredLocale ?? "en-US";

    let profileInformation = await getSteamProfileInformation(steamId.get64());
    profileInformation = profileInformation.response.players[0];

    if (isNullish(profileInformation)) {
      return;
    }

    const creationInstant = Temporal.Instant.fromEpochMilliseconds(profileInformation.timecreated * 1000);
    const onlineInstant = Temporal.Instant.fromEpochMilliseconds(profileInformation.lastlogoff * 1000);
    const profileCreated = creationInstant.toZonedDateTimeISO("UTC").toPlainDate();
    const lastOnline = onlineInstant.toZonedDateTimeISO("UTC").toPlainDate();

    const country = profileInformation.loccountrycode ? `\:flag_${profileInformation.loccountrycode.toLowerCase()}: ` : "";

    const components = [
      new ContainerBuilder()
        .addSectionComponents(
          new SectionBuilder()
            .setThumbnailAccessory(
              new ThumbnailBuilder()
                .setURL(profileInformation.avatarfull),
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ${country}${profileInformation.personaname}\nCreated: ${profileCreated.toLocaleString(guildLocale)}\nLast Online: ${lastOnline.toLocaleString(guildLocale)}`),
              new TextDisplayBuilder().setContent(`\`\`\`\n${steamId?.get64()}\`\`\``),
              new TextDisplayBuilder().setContent(`\`\`\`${steamId?.get3()}\`\`\``),
            ),
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        )
        .addActionRowComponents(
          new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("logs.tf")
                .setURL(`https://logs.tf/profile/${steamId}`),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("rgl.gg")
                .setURL(`https://rgl.gg/Public/PlayerProfile?p=${steamId}`),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("etf2l.org")
                .setURL(`https://etf2l.org/search/${steamId}`),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("demos.tf")
                .setURL(`https://demos.tf/profiles/${steamId}`),
            ),
        ),
    ];

    await send(msg, { components, flags: MessageFlags.IsComponentsV2 });
  }
}
