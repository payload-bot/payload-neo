import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types/Client";
import { Message } from "discord.js";

export default class Exec extends Command {
    constructor() {
        super(
            "remove",
            "**USING THESE COMMANDS IN A PUBLIC SERVER PUTS YOUR ACCOUNT AT RISK OF BEING HIJACKED! MAKE SURE TO USE THESE COMMANDS ONLY IN BOT DMS!**\n\nRemoves a server from your list.",
            [
                {
                    name: "name",
                    description: "The name of the server to remove.",
                    required: true,
                    type: "string"
                }
            ],
            undefined,
            undefined,
            ["dm"],
            undefined,
            undefined,
            ["server"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.parseArgs(msg, 1);
        const lang = await this.getLanguage(msg);

        if (args === false) {
            return false;
        }

        const targetServer = args[0];

        if (!targetServer) {
            return await this.fail(msg, lang.server_noname);
        }

        const user = await client.userManager.getUser(msg.author.id);

        if (!user.user.servers) {
            return await this.fail(msg, lang.server_noservers.replace("%prefix", await this.getPrefix(msg)));
        }

        const serverIndex = user.user.servers.findIndex(server => server.name == targetServer);

        if (serverIndex === 0) {
            return await this.fail(msg, lang.server_targetinvalid.replace("%target", targetServer));
        }

        user.user.servers.splice(serverIndex, 1);

        await user.save();

        await this.respond(msg, lang.server_removeserver.replace("%target", targetServer));

        return true;
    }    
}