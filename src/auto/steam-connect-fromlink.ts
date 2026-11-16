import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedColors } from "#utils/colors.ts";
import { GameDig } from "gamedig";
import { EmbedBuilder, Message } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Connect.Description,
  regex: /^steam:\/\/connect\/(?<ip>[^:\s]+)(?::(?<port>\d+))?(?=\/|$)(?:\/(?<password>.+))?/,
})
export default class UserAutoCommand extends AutoCommand {
  // @ts-ignore have to do this
  async messageRun(msg: Message, args: AutoCommand.Args, { matches }: AutoCommand.Context) {
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
      embed.setDescription(`${name}\n${players.length}/${maxplayers} ${args.t(LanguageKeys.Auto.Connect.Players)}`);
    } catch {
      embed.setColor(EmbedColors.Red);
      embed.setDescription(args.t(LanguageKeys.Auto.Connect.Offline));
    }

    await connectInfoEmbed.edit({ embeds: [embed] });
  }
}
