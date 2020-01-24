import { TextChannel } from "discord.js";
import config from "../config";

module.exports = {
    run: async (client, error) => {
        const channel = client.channels.get(config.info.errorChannel) as TextChannel;
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