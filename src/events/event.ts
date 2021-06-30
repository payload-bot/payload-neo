import { Client, TextChannel } from "discord.js";
import { EmbedColors } from "../lib/misc/colors";
import config from "../config";

type EventType = "STARTED";

async function handleEvent(client: Client, type: EventType) {
    const channel = client.channels.cache.get(config.info.eventChannel) as TextChannel;
    if (!channel) return;

    await channel.send({
        embed: {
            color: EmbedColors.DARK_ORANGE,
            timestamp: new Date(),
            title: "Event",
            description: `\`\`\`Event logged: ${type}\n\`\`\``,
        },
    });
}

export = {
    run: handleEvent,
};

