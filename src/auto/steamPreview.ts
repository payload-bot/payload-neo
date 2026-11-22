import { AutoCommand } from "#lib/structs/AutoResponse/AutoResponse.ts";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  Message,
  type MessageActionRowComponentBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";
import { MessageFlags } from "discord.js";
import { getSteamIdFromArgs } from "#utils/getSteamId.ts";
import { getSteamProfileInformation } from "#utils/steam-api.ts";
import { isNullish } from "@sapphire/utilities";

export default class SteamPreviewCommand extends AutoCommand {
  public constructor(context: AutoCommand.LoaderContext, options: AutoCommand.Options) {
    super(context, {
      ...options,
      description: LanguageKeys.Auto.Logs.Description,
      regex: /http(s|):\/\/(www\.|)steamcommunity\.com\/(profiles|id)\/(?<id>\w+)/,
    });
  }

  async run(msg: Message, _: AutoCommand.RunContext) {
    const allMatches = msg.content.match(this.regex)!;
    const idOrVanityUrl = allMatches.groups?.id;

    if (!idOrVanityUrl) {
      return;
    }

    const steamId = await getSteamIdFromArgs(idOrVanityUrl);

    if (isNullish(steamId)) {
      return;
    }

    const guildLocale = msg.guild?.preferredLocale ?? "en-US";

    let profileInformation = await getSteamProfileInformation(steamId.get64());
    profileInformation = profileInformation.response.players[0];

    if (isNullish(profileInformation)) {
      return;
    }

    let creationDate = "";
    let lastOnline = "";

    if (profileInformation.timecreated) {
      const creationInstant = Temporal.Instant.fromEpochMilliseconds(
        profileInformation.timecreated * 1000,
      );
      const profileCreated = creationInstant.toZonedDateTimeISO("UTC").toPlainDate();
      creationDate = `Created: ${profileCreated.toLocaleString(guildLocale)}\n`;
    }

    if (profileInformation.lastlogoff) {
      const onlineInstant = Temporal.Instant.fromEpochMilliseconds(
        profileInformation.lastlogoff * 1000,
      );
      const date = onlineInstant.toZonedDateTimeISO("UTC").toPlainDate();
      lastOnline = `Last Online: ${date.toLocaleString(guildLocale)}`;
    }

    const country = profileInformation.loccountrycode
      ? `\:flag_${profileInformation.loccountrycode.toLowerCase()}: `
      : "";

    const components = [
      new ContainerBuilder()
        .addSectionComponents(
          new SectionBuilder()
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(profileInformation.avatarfull))
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `# ${country}[${profileInformation.personaname}](https://steamcommunity.com/profiles/${steamId})\n${creationDate}${lastOnline}`,
              ),
              new TextDisplayBuilder().setContent(`\`\`\`\n${steamId?.get64()}\`\`\``),
              new TextDisplayBuilder().setContent(`\`\`\`${steamId?.get3()}\`\`\``),
            ),
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        )
        .addActionRowComponents(
          new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
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
