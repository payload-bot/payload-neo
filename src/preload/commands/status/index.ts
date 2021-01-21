import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";
import { formatDistanceToNowStrict } from 'date-fns'

export default class Status extends Command {
    constructor() {
        super(
            "status",
            "Gets client status.",
            undefined,
            undefined,
            undefined,
            undefined,
            true
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const duration = formatDistanceToNowStrict(Date.now() - client.uptime);

        const string = `Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\nUptime: ${duration}`
        await msg.channel.send(string);

        return true;
    }
}