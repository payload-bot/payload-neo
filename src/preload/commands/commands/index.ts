import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, MessageEmbed } from "discord.js";
import Language from "../../../lib/types/Language";

export default class Commands extends Command {

    constructor() {
        super(
            "commands",
            "Displays all commands"
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const lang: Language = await this.getLanguage(msg);
        let embed = new MessageEmbed();
        let commandsToDisplay: string;
        const allCommands = client.commands.filter(cmds => !cmds.requiresRoot && !cmds.name.includes("pugscrim")).map(cmd => cmd.name);

        if (msg.guild) {
            let serverManager = client.serverManager;
            let server = await serverManager.getServer(msg.guild.id);
            let commandRestrictions: any = server.getCommandRestrictions(msg.channel.id);

            const commandsConcat = [...new Set(commandRestrictions.concat(allCommands))];
            commandsToDisplay = commandsConcat.slice(commandRestrictions.length).join(", ")
        } else {
            commandsToDisplay = allCommands.join(", ");
        }


        embed.setAuthor(`${client.user.tag}`, client.user.avatarURL());
        embed.setTitle(lang.commands_embedtitle);
        embed.addField(lang.commands_commands, commandsToDisplay);
        embed.addField(lang.commands_autoresponses, client.autoResponses.map(cmd => cmd.name).join(', '));
        embed.setFooter(lang.commands_embedfooter.replace('%prefix', await this.getPrefix(msg)));
        embed.setColor(16098851);
        msg.channel.send(embed);
        return true;
    }
}