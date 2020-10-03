import { TextChannel } from "discord.js";
import config from "../config";
import { Client } from "../lib/types";

module.exports = {
    run: async (client: Client, item: string) => {
        const channel = client.channels.cache.get(config.info.errorChannel) as TextChannel;
        if (!channel) return;
        channel.send({
            embed: {
                color: 3066993,
                timestamp: new Date(),
                title: `Event logger`,
                description: `\`\`\`${item}\`\`\``
            }
        });
    }
}