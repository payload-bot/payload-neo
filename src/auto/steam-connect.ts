import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedColors } from "#utils/colors.ts";
import { GameDig } from "gamedig";
import { EmbedBuilder, Message } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Connect.LinkDescription,
  regex: /connect (https?:\/\/)?(.+\.)+\w+(:\d+)?; ?password .+([^\n`$])/,
})
export default class UserAutoCommand extends AutoCommand {
  // @ts-ignore have to do this
  async messageRun(msg: Message, args: AutoCommand.Args, { matched }: AutoCommand.Context) {
    const connectInfo = matched.trim();
    const parts = connectInfo.split(";");

    const ip = parts[0].replace(/^connect (https?:\/\/)?/, "");
    const ipNoPort = ip.split(":")[0];
    const port = ip.split(":")[1] || "27015";
    const password = parts
      .slice(1)
      .join(";")
      .replace(/"|;$/g, "")
      .replace(/^ ?password /, "");

    const title = `${ip}/${encodeURIComponent(password)}`;

    const embed = new EmbedBuilder({
      title: title.length > 250 ? title.slice(0, 250) : title,
      url: `https://api.payload.tf/api/steam?ip=${ip}&pw=${encodeURIComponent(password)}`,
    });

    const connectInfoEmbed = await send(msg, { embeds: [embed] });

    try {
      const { name, maxplayers, players } = await GameDig.query({
        type: "tf2",
        socketTimeout: 5000,
        attemptTimeout: 5000,
        host: ipNoPort,
        port: parseInt(port, 10),
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
