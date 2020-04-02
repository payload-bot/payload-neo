import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message, MessageEmbed } from "discord.js";
import colors from "../../../../lib/misc/colors";
import config from "../../../../config";

export default class Delete extends Command {
    constructor() {
        super(
            "delete",
            "Deletes guild prefix",
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
        let embed = new MessageEmbed();
        const lang = await this.getLanguage(msg);

        const server = await client.serverManager.getServer(msg.guild.id);
        
        embed.setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL());
        embed.setColor(colors.red);
        embed.setDescription(lang.prefix_delete_success.replace('%prefix', config.PREFIX));
        embed.setTitle(lang.prefix_delete_embedfooter.replace('%author', msg.author.tag));
        embed.setTimestamp();

        server.server.prefix = config.PREFIX;

        await server.save();

        await msg.channel.send(embed);
        return true;
    }
}