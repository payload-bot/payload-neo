import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";

export default class Unrestrict extends Command {
    constructor() {
        super(
            "unrestrict",
            "Unrestricts a command from being used in a channel. Using `{all}` as a command argument unrestrics all commands and using `#{all}` as a channel argument unrestricts the commands in all text channels.",
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
        
        const serverManager = client.serverManager;
        const server = await serverManager.ensureServer(msg.guild.id);

        server.removeCommandRestrictions(
            channels.map(channelID => {
                return {
                    channelID,
                    commands
                };
            })
        );

        await server.save();

        await this.respond(msg, lang.unrestrict_success.replace('%channels', (allChannels ? lang.restrict_allcmnds : channels.map(channelID => `<#${channelID}>`).join(", "))).replace('%cmds', (commands.length > 0) ? (allCommands ? lang.restrict_allchns : commands.join("\n")) : lang.restrict_none));

        return true;
    }
}