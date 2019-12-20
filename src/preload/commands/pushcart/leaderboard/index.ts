import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message, RichEmbed } from "discord.js";

export default class Leaderboard extends Command {
    constructor() {
        super(
            "leaderboard",
            "Shows the pushcart user leaderboard.",
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
        if (!client.leaderboard) {
            return await this.fail(msg, "Leaderboard has not yet been generated. Try again in a couple minutes.");
        }

        const top10 = client.leaderboard.users.slice(0, 10);

        let isTop10 = false;
        let leaderboardString = "```md\n";

        for (let i = 0; i < top10.length; i++) {
            let tag = (client.users.get(top10[i].id) || await client.fetchUser(top10[i].id)).tag;

            if (top10[i].id == msg.author.id) {
                leaderboardString += `> ${i + 1}: ${tag} (${top10[i].pushed})\n`;
                isTop10 = true;
            } else {
                leaderboardString += `${i + 1}: ${tag} (${top10[i].pushed})\n`;
            }
        }

        if (!isTop10) leaderboardString += `...\n> ${client.leaderboard.users.findIndex(user => user.id == msg.author.id) + 1}: ${msg.author.tag} (${(client.leaderboard.users.find(user => user.id == msg.author.id) || { pushed: 0 }).pushed})\n`;

        leaderboardString += "```";

        await msg.channel.send(new RichEmbed({
            title: "Pushcart Leaderboard",
            description: leaderboardString,
            footer: {
                text: `Last updated: ${client.leaderboard.updated.toLocaleString()}`
            }
        }));

        return true;
    }
}