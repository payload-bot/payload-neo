import { TextChannel } from "discord.js";
import config from "../config";
import { Client } from "../lib/types";

module.exports = {
    run: async (client: Client, error: Error) => {
        const channel = client.channels.cache.get(config.info.errorChannel) as TextChannel;
        if (!channel) return;
        channel.send({
            embed: {
                color: 15158332,
                timestamp: new Date(),
                title: 'Error',
                description: error.stack ? `\`\`\`x86asm\n${error.stack}\n\`\`\`` : `\`${error.toString()}\``
            }
        });
    }
}