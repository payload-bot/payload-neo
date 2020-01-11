import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message } from "discord.js";
import config from "../../../../config";

export default class Show extends Command {
    constructor() {
        super(
            "show",
            "Shows guild prefix",
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            ["prefix"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const server = await client.serverManager.getServer(msg.guild.id);
        let prefix = server.getPrefixFromGuild(msg.guild.id);
        if (!prefix) prefix = config.PREFIX;

        await this.respond(msg, `Your guild prefix is: \`${prefix}\``)
        return true;
    }
}