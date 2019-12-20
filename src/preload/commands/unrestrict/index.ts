import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message } from "discord.js";

export default class Unrestrict extends Command {
    constructor() {
        super(
            "unrestrict",
            "Unrestricts a command from being used in a channel. Using `{all}` as a command argument unrestrics all commands and using `#{all}` as a channel argument unrestricts the commands in all text channels.",
            [
                {
                    name: "command",
                    description: "A command to unrestrict. Can be \"{all}\" to unrestrict all commands.",
                    required: true,
                    type: "string"
                },
                {
                    name: "command 2",
                    description: "More commands to unrestrict.",
                    required: false,
                    type: "string"
                },
                {
                    name: "channel mention",
                    description: "The text channel to unrestrict commands in. Can be \"#{all}\" to unrestrict commands in all text channels.",
                    required: false,
                    type: "string"
                },
                {
                    name: "channel mention 2",
                    description: "More text channels to unrestrict commands in.",
                    required: false,
                    type: "string"
                }
            ],
            undefined,
            ["SEND_MESSAGES", "MANAGE_CHANNELS"],
            ["text"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args = await this.parseArgs(msg) as string[] | false;

        if (args === false) {
            return false;
        }

        let commands: string[] = [];
        let channels: string[] = [];
        let allCommands = false;
        let allChannels = false;

        for (let i = 0; i < args.length; i++) {
            if (args[i].match(/^<#\d+>$/)) channels.push(args[i].slice(2, -1));
            else if (args[i].toLowerCase() == "#{all}") {
                allChannels = true;
                channels.push(...msg.guild.channels.filter(channel => channel.type == "text").map(channel => channel.id));
            }
            else if (args[i].toLowerCase() == "{all}") {
                allCommands = true;
                commands.push(...client.commands.filter(command => !["restrict", "unrestrict"].includes(command.name)).map(command => command.name));
            }
            else commands.push(args[i]);
        }
    
        if (channels.length == 0) {
            channels = [ msg.channel.id ];
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
    
        await this.respond(msg, `Unrestricted in ${allChannels ? "ALL CHANNELS" : channels.map(channelID => `<#${channelID}>`).join(", ")}: \`\`\`${allCommands ? "ALL COMMANDS" : commands.join("\n")}\`\`\``);

        return true;
    }
}