import { Client } from "../../lib/types/Client";
import { Message, MessageEmbed } from "discord.js";
import { AutoResponse } from "../../lib/exec/Autoresponse";
import SourceQuery from "sourcequery"
import { EmbedColors } from "../../lib/misc/colors";
import Language from "../../lib/types/Language";
import { SourceQuery as SourceQueryTypes } from "../../lib/types/sourcequery";
export default class SteamConnectLink extends AutoResponse {

    constructor() {
        super(
            "steam connect info",
            "Automatically sends steam connect links when raw connect info is posted.",
            /connect (https?:\/\/)?(.+\.)+\w+(:\d+)?; ?password .+([^\n`$])/,
            ["SEND_MESSAGES", "EMBED_LINKS"]
        )
    }

    async run(client: Client, msg: Message): Promise<void> {
        let connectInfo = msg.content.match(this.pattern) as RegExpExecArray;
        let parts = connectInfo[0].trim().split(";");
        const lang: Language = await this.getLanguage(msg)

        let ip = parts[0].replace(/^connect (https?:\/\/)?/, "");
        let ipNoPort = ip.split(":")[0];
        let port = ip.split(":")[1] || "27015";
        let password = parts.slice(1).join(";").replace(/"|;$/g, "").replace(/^ ?password /, "");

        let embed = new MessageEmbed();
        embed.setTitle(`steam://connect/${ip}/${encodeURIComponent(password)}`);

        let connectInfoEmbed = await msg.channel.send(embed) as Message;

        let sq = new SourceQuery(5000) as SourceQueryTypes;
        sq.open(ipNoPort, Number(port));
        sq.getInfo((err, info) => {
            if (err) {
                embed.setColor(EmbedColors.RED);
                embed.setDescription(lang.servers_offline);
            } else {
                embed.setColor(EmbedColors.GREEN);
                embed.setDescription(`${info.name}\n${info.players}/${info.maxplayers} ${lang.servers_players}`);
            }

            connectInfoEmbed.edit(embed);
        });
    }
}