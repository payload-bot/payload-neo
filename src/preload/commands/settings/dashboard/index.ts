import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message } from "discord.js";

export default class DashboardPermissions extends Command {
    constructor() {
        super(
            "dashboard",
            "Sets dashboard access permissions.",
            [
                {
                    name: "Permission",
                    description: "The permission to give",
                    required: true,
                    type: "string",
                    options: ["admin", "moderator"]
                }
            ],
            undefined,
            undefined,
            ["text"],
            undefined,
            undefined,
            ["settings"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const lang = await this.getLanguage(msg);
        const args = await this.parseArgs(msg, 1)

        const server = await client.serverManager.getServer(msg.guild.id)

        if (args && args[0]) {
            const arg = args[0]
            if (arg === "admin") {
                server.server.settings.dashboardPermRoles = ["ADMINISTRATOR"]
                await this.respond(msg, lang.dashboard_admin)
            } else if (arg === "moderator") {
                server.server.settings.dashboardPermRoles = ["MANAGE_GUILD"]
                await this.respond(msg, lang.dashboard_mod)
            }
        }

        await server.save()

        return true;
    }
}