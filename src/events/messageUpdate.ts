import { handleMessageDelete, cleanCache } from "../util/snipe-cache";
import config from "../config";
import { Message } from "discord.js";
import { Client } from "../lib/types";

module.exports = {
    run: async (client: Client, oldMsg: Message, newMsg: Message) => {
        handleMessageDelete(client, oldMsg);
        cleanCache(client, oldMsg);

        if (oldMsg.content === newMsg.content) return;
        if (!oldMsg.guild && oldMsg.content.startsWith(config.PREFIX)) client.emit("message", newMsg);
        else {
            const server = await client.serverManager.getServer(oldMsg.guild.id);
            const prefix = server.getPrefixFromGuild(oldMsg.guild.id);
            if (oldMsg.content.startsWith(prefix) && oldMsg.author.id === newMsg.author.id) {
                //Get last bot message
                const lastMessages = await newMsg.channel.messages.fetch({ limit: 5 });
                const lastBotMessage = lastMessages.find((message => message.author.id == client.user.id));
                //Delete that old bot response and paste in a new one
                if (lastBotMessage.deletable) lastBotMessage.delete();
                client.emit("message", newMsg);
            } else if (oldMsg.content.startsWith(prefix)) {
                //Default case for if multiple users are messaging at once
                client.emit("message", newMsg);
            }
        }
    }
}