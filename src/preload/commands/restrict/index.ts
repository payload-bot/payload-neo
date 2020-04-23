import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";

export default class Restrict extends Command {
    constructor() {
        super(
            "restrict",
            "Restricts a command from being used in a channel. Using `{all}` as a command argument restrics all commands and using `#{all}` as a channel argument restricts the commands in all text channels.",
            undefined,
            undefined,
            ["SEND_MESSAGES", "MANAGE_CHANNELS"],
            ["text"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args: any = await this.getArgs(msg)
        const lang = await this.getLanguage(msg);

        if (args === false) {
            return false;
        }

        let commands: string[] = [];
        let channels: string[] = [];
        let allCommands = false;
        let allChannels = false;

        for (let i = 0; i < args.length; i++) {
            if (args[i].match(/\<\#\d+\>/g)) channels.push(args[i].slice(2, -1));
            else if (args[i].toLowerCase() == "#{all}") {
                allChannels = true;
                channels.push(...msg.guild.channels.cache.filter(channel => channel.type == "text").map(channel => channel.id));
            }
            else if (args[i].toLowerCase() == "{all}") {
                allCommands = true;
                commands.push(...client.commands.filter(command => !["restrict", "unrestrict"].includes(command.name)).map(command => command.name));
            }
            else {
                if (!client.commands.map(cmds => cmds.name).includes(args[i])) continue;
                if (args[i] === "8ball") commands.push(args[i]);
                commands.push(args[i]); 
            }
        }

        if (channels.length == 0) {
            channels = [msg.channel.id];
        }

        if (commands.includes("restrict") || commands.includes("unrestrict")) return await this.fail(msg, lang.restrict_fail_deny);

        const serverManager = client.serverManager;
        const server = await serverManager.ensureServer(msg.guild.id);

        server.addCommandRestrictions(
            channels.map(channelID => {
                return {
                    channelID,
                    commands
                };
            })
        );

        await server.save();

        await this.respond(msg, lang.restrict_success.replace('%channels', (allChannels ? lang.restrict_allchns : channels.map(channelID => `<#${channelID}>`).join(", "))).replace('%cmds', (commands.length > 0) ? (allCommands ? lang.restrict_allcmnds : commands.join("\n")) : lang.restrict_none));

        return true;
    }
}