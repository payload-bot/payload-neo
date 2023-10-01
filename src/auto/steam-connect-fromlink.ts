import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedColors } from "#utils/colors";
import gamedig from "gamedig";
import { Message, EmbedBuilder } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Connect.Description,
  regex: /steam:\/\/connect\/(\w+\.)+\w+(:\d+)?\/.+([^\n`$])/,
})
export default class UserAutoCommand extends AutoCommand {
  // @ts-ignore
  async messageRun(msg: Message, args: AutoCommand.Args, { matched }: AutoCommand.Context) {
    const parts = matched.trim().replace("steam://connect/", "").split("/");

    const ip = parts[0];
    const ipNoPort = ip.split(":")[0];
    const port = ip.split(":")[1] || "27015";
    const password = decodeURIComponent(parts[1]);

    const title = `${ip}/${encodeURIComponent(password)}`;

    const embed = new EmbedBuilder({
      title: title.length > 250 ? title.slice(0, 250) : title,
      url: `https://api.payload.tf/api/steam?ip=${ip}&pw=${encodeURIComponent(password)}`,
    });

    const connectInfoEmbed = await send(msg, { embeds: [embed] });

    try {
      const { name, maxplayers, players } = await gamedig.query({
        type: "tf2",
        host: ipNoPort,
        port: parseInt(port),
      });

      embed.setColor(EmbedColors.Green);
      embed.setDescription(`${name}\n${players.length}/${maxplayers} ${args.t(LanguageKeys.Auto.Connect.Players)}`);
    } catch (err) {
      embed.setColor(EmbedColors.Red);
      embed.setDescription(args.t(LanguageKeys.Auto.Connect.Offline));
    }

    await connectInfoEmbed.edit({ embeds: [embed] });
  }
}
