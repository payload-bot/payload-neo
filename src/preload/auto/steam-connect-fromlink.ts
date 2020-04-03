import { Client } from "../../lib/types/Client";
import { Message, MessageEmbed } from "discord.js";
import { AutoResponse } from "../../lib/exec/Autoresponse";
import SourceQuery from "sourcequery"
import colors from "../../lib/misc/colors";

export default class SteamConnectLink extends AutoResponse {

    constructor() {
        super(
            "steam connect link",
            "Automatically sends steam connect links when a detected clickable link is posted.",
            /steam:\/\/connect\/(\w+\.)+\w+(:\d+)?\/.+/,
            ["SEND_MESSAGES", "EMBED_LINKS"]
        )
    }

    async run(client: Client, msg: Message): Promise<void> {
        let connectLink = msg.content.match(this.pattern) as RegExpExecArray;
        let parts = connectLink[0].replace("steam://connect/", "").split("/");
        const lang = await this.getLanguage(msg)

        let ip = parts[0];
        let ipNoPort = ip.split(":")[0];
        let port = ip.split(":")[1] || "27015";
        let password = decodeURIComponent(parts[1]);

        let embed = new MessageEmbed();
        embed.setTitle(`connect ${ip}; password "${password}"`);

        let connectInfoEmbed = await msg.channel.send(embed) as Message;

        let sq = new SourceQuery(1000);
        sq.open(ipNoPort, Number(port));
        sq.getInfo((err, info) => {
            if (err) {
                client.emit("error", err);
                embed.setColor(colors.red);
                embed.setDescription(lang.servers_offline);
            } else {
                embed.setColor(colors.green);
                embed.setDescription(`${info.name}\n${info.players}/${info.maxplayers} ${lang.servers_players}`);
            }

            connectInfoEmbed.edit(embed);
        });
    }
}