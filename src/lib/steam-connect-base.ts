import { AutoCommand } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { EmbedColors } from "#utils/colors.ts";
import { GameDig } from "gamedig";
import { EmbedBuilder, Message } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";
import { fetchT } from "@sapphire/plugin-i18next";

export default class SteamConnectBase extends AutoCommand {
  // @ts-ignore have to do this
  async messageRun(msg: Message, args: AutoCommand.Args, { matches }: AutoCommand.Context) {
    const t = await fetchT(msg);

    const ip = matches.groups!.ip;
    const port = matches.groups!.port ?? "27015";
    const password = matches.groups!.password;

    const urlBase = "https://api.payload.tf/api/steam";
    const searchParams = new URLSearchParams([["ip", ip]]);

    let title = `${ip}`;

    if (password) {
      title += `/${password}`;
      searchParams.set("pw", encodeURIComponent(password));
    }

    const embed = new EmbedBuilder({
      title: title.length > 250 ? title.slice(0, 250) : title,
      url: `${urlBase}?${searchParams}`,
    });

    const connectInfoEmbed = await send(msg, { embeds: [embed] });

    try {
      const { name, maxplayers, players } = await GameDig.query({
        type: "teamfortress2",
        host: ip,
        port: parseInt(port),
      });

      embed.setColor(EmbedColors.Green);
      embed.setDescription(`${name}\n${players.length}/${maxplayers} ${t(LanguageKeys.Auto.Connect.Players)}`);
    } catch {
      embed.setColor(EmbedColors.Red);
      embed.setDescription(t(LanguageKeys.Auto.Connect.Offline));
    }

    await connectInfoEmbed.edit({ embeds: [embed] });
  }
}
