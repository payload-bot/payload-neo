import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types/Client";
import { Message } from "discord.js";

export default class Exec extends Command {
    constructor() {
        super(
            "list",
            "**USING THESE COMMANDS IN A PUBLIC SERVER PUTS YOUR ACCOUNT AT RISK OF BEING HIJACKED! MAKE SURE TO USE THESE COMMANDS ONLY IN BOT DMS!**\n\nLists your servers.",
            undefined,
            undefined,
            undefined,
            ["dm"],
            undefined,
            undefined,
            ["server"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const user = await client.userManager.getUser(msg.author.id);
        const lang = await this.getLanguage(msg);

        if (!user.user.servers || user.user.servers.length === 0) {
            return await this.fail(msg, lang.server_noservers.replace("%prefix", await this.getPrefix(msg)));
        }

        await this.respond(msg,
            "```AsciiDoc\n" +
            user.user.servers.map(server => `[${server.name}]\n\t${server.address}\n\t${server.rconPassword}`).join("\n") +
            "\n```"
        );

        return true;
    }    
}