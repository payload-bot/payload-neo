import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";

export default class Purge extends Command {
    constructor() {
        super(
            "purge",
            "Purges a certain number of messages sent by a user or everyone if no user is mentioned.",
            [
                {
                    name: "amount",
                    description: "The amount of messages to delete.",
                    required: true,
                    type: "number",
                    min: 1,
                    max: 100
                },
                {
                    name: "user mentions",
                    description: "The users to filter.",
                    required: false,
                    type: "string"
                }
            ],
            ["SEND_MESSAGES", "MANAGE_MESSAGES"],
            ["SEND_MESSAGES", "MANAGE_MESSAGES"],
            ["text"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.parseArgs(msg);

        if (args === false) {
            return false;
        }

        const amount = args[0];
        const users = msg.mentions.users;

        msg.channel.startTyping();

        await msg.delete();

        const startTime = Date.now();

        let channelMessages = await msg.channel.fetchMessages({
            limit: 100
        });

        if (users.size > 0) {
            channelMessages = channelMessages.filter(foundMsg => {
                return msg.mentions.users.map(user => user.id).includes(foundMsg.author.id);
            });
        }

        channelMessages = channelMessages.filter(channelMessage => {
            return Date.now() - channelMessage.createdTimestamp < 1000 * 60 * 60 * 24 * 14;
        });

        const deletedMessages = await msg.channel.bulkDelete(channelMessages.map(channelMessage => channelMessage.id).slice(0, amount as number));

        await this.respond(msg, `🗑 Deleted **${deletedMessages.size}** messages in **${(Date.now() - startTime) / 1000}** seconds.`);

        return true;
    }
}