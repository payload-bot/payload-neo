import { TextChannel } from "discord.js";
import config from "../config";

module.exports = {
    run: async (client, error, name) => {
        const channel = client.channels.cache.get(config.info.errorChannel) as TextChannel;
    channel.send({
        embed: {
            color: 15105570,
            timestamp: new Date(),
            title: `Warning: ${name}`,
            description: `\`\`\`${error}\`\`\``
        }
    });
    }
}