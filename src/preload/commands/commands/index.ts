import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, RichEmbed } from "discord.js";
import config from "../../../config";

export default class Commands extends Command {

    constructor() {
        super(
            "commands",
            "Displays all commands"
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        let embed = new RichEmbed();
        embed.setAuthor("TFBot", client.user.avatarURL);
        embed.setTitle(`List of all commands`);
        embed.addField("Commands",(client.commands.filter(cmds => !cmds.requiresRoot && !cmds.name.includes("api")).map(cmd => cmd.name).join(', ')));
        embed.addField("Automatic Commands", client.autoResponses.map(cmd => cmd.name).join(', '));
        embed.setFooter(`\nYou can say ${config.PREFIX}help [command name] to get info on a specific command!`);
        embed.setColor(16098851);
        msg.channel.send(embed);
        return true;
    }
}