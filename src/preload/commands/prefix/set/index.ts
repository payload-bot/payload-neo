import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message, RichEmbed } from "discord.js";
import colors from "../../../../lib/misc/colors";
import config from "../../../../config";

export default class Set extends Command {
    constructor() {
        super(
            "set",
            "Sets guild prefix",
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            ["prefix"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        let embed = new RichEmbed();
        let newPrefix = (await this.getArgs(msg, 2)).join(" ");

        const server = await client.serverManager.getServer(msg.guild.id);
        let oldPrefix = server.getPrefixFromGuild(msg.guild.id);

        if (oldPrefix === newPrefix) return await this.fail(msg, "Your old prefix is the same as your new one!");
        if (!newPrefix) return await this.fail(msg, "You didn't specify a new prefix!");
        
        embed.setAuthor(`${client.user.tag}`, client.user.displayAvatarURL);
        embed.setColor(colors.red);
        embed.setDescription(`Guild prefix set to: \`${newPrefix}\``);
        embed.setTitle(`Guild prefix updated by ${msg.author.tag}`);
        embed.setTimestamp();

        server.server.prefix = newPrefix;

        await server.save();

        await msg.channel.send(embed);
        return true;
    }
}