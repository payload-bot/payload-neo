import { handleMessageDelete, cleanCache } from "../util/snipe-cache";
import config from "../config";

module.exports = {
    run: async (client, oldMsg, newMsg) => {
        handleMessageDelete(client, oldMsg);
        cleanCache(client, oldMsg);

        if (oldMsg.content === newMsg.content) return;

        if (oldMsg.guild) {
            const server = await client.serverManager.getServer(oldMsg.guild.id);
            const prefix = server.getPrefixFromGuild(oldMsg.guild.id);
            if (oldMsg.content.startsWith(prefix)) client.emit("message", (newMsg));
        } else {
            if (oldMsg.content.startsWith(config.PREFIX)) client.emit("message", (newMsg));
        }
    }
}