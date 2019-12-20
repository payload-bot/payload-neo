import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";
import { getPingCache, pingChannelCacheExists, renderMessage } from "../../../util/snipe-cache";

export default class FindPing extends Command {
    constructor() {
        super(
            "findping",
            "Retrieves a deleted ping (if any exist in cache).",
            undefined,
            ["SEND_MESSAGES", "ATTACH_FILES"],
            undefined,
            ["text"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        if (!pingChannelCacheExists(client, msg) || getPingCache(client, msg).size == 0) {
            return await this.fail(msg, "You haven't been pinged in any deleted messages.");
        }
    
        msg.channel.startTyping();
    
        const targetMessages = getPingCache(client, msg).filter(message => !!message.mentions.members.find(member => member.id == msg.author.id));
    
        if (targetMessages.size < 1) return await this.fail(msg, "You haven't been pinged in any deleted messages.");
    
        const targetMessage = targetMessages.last();
    
        const msgData = await renderMessage(targetMessage);
    
        await msg.channel.send({
            files: [msgData.buffer]
        });
    
        if (msgData.attachments || msgData.links) {
            await this.respond(msg, msgData.attachments + "\n" + msgData.links);
        }

        return true;
    }
}