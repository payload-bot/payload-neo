import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message } from "discord.js";
import Language from "../../../../lib/types/Language";

export default class Rank extends Command {
    constructor() {
        super(
            "rank",
            "Shows a user's pushcart rank.",
            [
                {
                    name: "user mention",
                    description: "The user to pull the rank from.",
                    required: false,
                    type: "string"
                }
            ],
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            ["pushcart"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const lang: Language = await this.getLanguage(msg);
        if (!client.leaderboard) {
            return await this.fail(msg, lang.pushcart_fail_noleaderboard);
        }

        const targetUser = msg.mentions.users.first() || msg.author;

        const rank = client.leaderboard.users.findIndex(user => user.id == targetUser.id) + 1;
        const feetPushed = (client.leaderboard.users.find(user => user.id == targetUser.id) || { pushed: 0 }).pushed;
        await this.respond(msg, `\`\`\`#${rank}: ${targetUser.tag} (${feetPushed})\`\`\``);

        return true;
    }
}