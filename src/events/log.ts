import { TextChannel } from "discord.js";
import config from "../config";

module.exports = {
    run: async (client, item) => {
        const channel = client.channels.get(config.info.errorChannel) as TextChannel;
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