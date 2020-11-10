import { Message } from "discord.js";
import { Client } from "../lib/types";
import { handleMessageDelete } from "../util/snipe-cache";

module.exports = {
    run: async (client: Client, msg: Message) => {
        handleMessageDelete(client, msg);
    }
}