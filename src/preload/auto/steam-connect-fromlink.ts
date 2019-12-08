import {Client} from "../../lib/types/Client"
import { Message, RichEmbed } from "discord.js";
import SourceQuery from "sourcequery"
import colors from "../../lib/misc/colors";

export const name = "steam connect info";
export const description = "Automatically sends steam connect links when raw connect info is posted.";
export const pattern = /steam:\/\/connect\/(\w+\.)+\w+(:\d+)?\/.+/;
export const permissions = ["SEND_MESSAGES", "EMBED_LINKS"];
export const zones = ["text", "dm"];

export async function run(client: Client, msg: Message) {
    let connectLink = msg.content.match(pattern) as RegExpExecArray;
    let parts = connectLink[0].replace("steam://connect/", "").split("/");

    let ip = parts[0];
    let ipNoPort = ip.split(":")[0];
    let port = ip.split(":")[1] || "27015";
    let password = decodeURIComponent(parts[1]);

    let embed = new RichEmbed();
        embed.setTitle(`connect ${ip}; password "${password}"`);

    let connectInfoEmbed = await msg.channel.send(embed) as Message;

    let sq = new SourceQuery(1000);
    sq.open(ipNoPort, Number(port));
    sq.getInfo((err, info) => {
        if (err) {
            embed.setColor(colors.red);
            embed.setDescription("Server is offline.");
        } else {
            embed.setColor(colors.green);
            embed.setDescription(`${info.name}\n${info.players}/${info.maxplayers} players`);
        }

        connectInfoEmbed.edit(embed);
    });
}

function matchMsg(msg: Message) {
    let match = msg.content.match(pattern) as RegExpMatchArray;

    return match[0];
}