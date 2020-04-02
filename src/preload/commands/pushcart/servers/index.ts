import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message, MessageEmbed } from "discord.js";
import { Server, ServerModel } from "../../../../lib/model/Server";
import { qSort } from "../../../../util/sort";

export default class Servers extends Command {
    constructor() {
        super(
            "servers",
            "Shows the top 5 pushcart servers.",
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            ["pushcart"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const lang = await this.getLanguage(msg);
        msg.channel.startTyping();

        let servers: ServerModel[] = await Server.find({
            "fun.payloadFeetPushed": {
                $exists: true
            }
        });

        let leaderboard = qSort(servers.map(server => {
            return {
                id: server.id,
                pushed: server.fun!.payloadFeetPushed
            };
        }), (serverA, serverB) => {
            return serverB.pushed - serverA.pushed;
        });

        const top5 = leaderboard.slice(0, 5);

        let leaderboardString = "```md\n";

        for (let i = 0; i < top5.length; i++) {
            let identifier = (client.guilds.cache.get(top5[i].id).name);

            identifier = (identifier as String).replace(/\`\`\`/g, "");

            if (identifier == msg.guild.name) {
                leaderboardString += `> ${i + 1}: ${identifier} (${top5[i].pushed})\n`;
            } else {
                leaderboardString += `${i + 1}: ${identifier} (${top5[i].pushed})\n`;
            }
        }

        leaderboardString += "```";

        await msg.channel.send(new MessageEmbed({
            title: lang.pushcart_serverembedtitle,
            description: leaderboardString
        }));

        return true;
    }
}