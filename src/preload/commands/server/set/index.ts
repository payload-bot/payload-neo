import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types/Client";
import { Message } from "discord.js";

export default class Exec extends Command {
    constructor() {
        super(
            "set",
            "**USING THESE COMMANDS IN A PUBLIC SERVER PUTS YOUR ACCOUNT AT RISK OF BEING HIJACKED! MAKE SURE TO USE THESE COMMANDS ONLY IN BOT DMS!**\n\nAdds a server to your list.",
            [
                {
                    name: "name",
                    description: "The name you want to save the server under.",
                    required: true,
                    type: "string"
                },
                {
                    name: "address",
                    description: "The server's address.",
                    required: true,
                    type: "string"
                },
                {
                    name: "rcon password",
                    description: "The server's Rcon password.",
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
        const args = await this.parseArgs(msg, 2);
        const lang = await this.getLanguage(msg);

        if (args === false) {
            return false;
        }

        const [serverName, address, rconPassword] = args as Array<string>

        const user = await client.userManager.getUser(msg.author.id);

        if (!user.user.servers) {
            user.user.servers = [];
        }

        if (user.user.servers.find(server => server.name == serverName)) {
            const serverIndex = user.user.servers.findIndex(server => server.name == serverName);

            user.user.servers[serverIndex] = {
                name: serverName,
                address,
                rconPassword
            };
        } else {
            user.user.servers.push({
                name: serverName,
                address,
                rconPassword
            });
        }

        await user.save();

        await this.respond(msg, lang.server_setserver.replace("%server", serverName).replace("%addr", address).replace("%password", rconPassword));

        return true;
    }    
}