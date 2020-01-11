import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, RichEmbed } from "discord.js";

export default class Commands extends Command {

    constructor() {
        super(
            "commands",
            "Displays all commands"
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        let embed = new RichEmbed();
        embed.setAuthor(`${client.user.tag}`, client.user.avatarURL);
        embed.setTitle(`List of all commands`);
        embed.addField("Commands",(client.commands.filter(cmds => !cmds.requiresRoot && !cmds.name.includes("pugscrim")).map(cmd => cmd.name).join(', ')));
        embed.addField("Automatic Commands", client.autoResponses.map(cmd => cmd.name).join(', '));
        embed.setFooter(`\nNeed help? \`${await this.getPrefix(msg)}help [command name]\` to get full info on a certain command.`);
        embed.setColor(16098851);
        msg.channel.send(embed);
        return true;
    }
}