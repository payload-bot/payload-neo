import { LanguageKeys } from "#lib/i18n/all";
import { AutoCommand } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { send } from "@sapphire/plugin-editable-commands";
import { fetchT } from "@sapphire/plugin-i18next";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  Message,
  MessageFlags,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from "discord.js";
import { GameDig } from "gamedig";
import { EmbedColors } from "./utils/colors.ts";

const MAP_PREVIEW_URL = "https://mapthumbnails.tf2pickup.org/unsafe/280x280/";
const STEAM_REDIRECT_URL = "https://api.payload.tf/api/steam";

export default class SteamConnectBase extends AutoCommand {
  async run(msg: Message, { matches }: AutoCommand.RunContext) {
    const t = await fetchT(msg);

    const ip = matches.groups!.ip!;
    const port = matches.groups!.port ?? "27015";
    const password = matches.groups!.password;

    let title = `${ip}:${port}`;
    let searchParams = `?ip=${title}`;

    if (password) {
      title += `/${password}`;
      searchParams += `&${encodeURIComponent(password)}`;
    }

    const steamUrl = `${STEAM_REDIRECT_URL}${searchParams}`;

    const buttons = new ActionRowBuilder<ButtonBuilder>();

    buttons.addComponents(
      new ButtonBuilder({
        label: t(LanguageKeys.Auto.Connect.JoinServerButton),
        style: ButtonStyle.Link,
        url: steamUrl,
      }),
    );

    const description = new TextDisplayBuilder().setContent(`## [${ip}](${steamUrl})`);

    const container = new ContainerBuilder()
      .setAccentColor(EmbedColors.Blue)
      .addTextDisplayComponents(description)
      .addActionRowComponents(buttons);

    const connectInfoEmbed = await send(msg, {
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    try {
      const { name, players, maxplayers, map, raw } = await GameDig.query({
        type: "teamfortress2",
        host: ip,
        port: parseInt(port),
      });

      const containerName = `## [${name}](${steamUrl})`;

      if ((raw as any).sourcetvport) {
        const joinStvButton = new ButtonBuilder({
          label: t(LanguageKeys.Auto.Connect.JoinStvButton),
          style: ButtonStyle.Link,
          url: `${STEAM_REDIRECT_URL}?ip=${ip}:${(raw as any).sourcetvport}`,
        });

        buttons.addComponents(joinStvButton);
      }
      const serverData = new TextDisplayBuilder().setContent(
        `${containerName}\n${players.length}/${maxplayers} ${t(LanguageKeys.Auto.Connect.Players)}`,
      );

      let thumbnail = null;

      const previewMapUrl = `${MAP_PREVIEW_URL}${map}.jpg`;
      const thumbnailExists = await fetch(previewMapUrl, { method: "HEAD" });
      if (thumbnailExists.ok) {
        thumbnail = new ThumbnailBuilder().setURL(previewMapUrl);
      }

      const displayComponent = thumbnail
        ? new SectionBuilder().addTextDisplayComponents(serverData).setThumbnailAccessory(thumbnail)
        : serverData;

      container.spliceComponents(0, 1, displayComponent);
      container.setAccentColor(EmbedColors.Green);
    } catch (e) {
      const serverData = new TextDisplayBuilder().setContent(t(LanguageKeys.Auto.Connect.Offline));
      container.spliceComponents(0, 1, serverData);
      container.setAccentColor(EmbedColors.Red);
    }

    await connectInfoEmbed.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }
}
