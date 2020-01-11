import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message, RichEmbed } from "discord.js";
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
        let embed = new RichEmbed();
        let string: string;

        const server = await client.serverManager.getServer(msg.guild.id);
        let prefix = server.getPrefixFromGuild(msg.guild.id);
        if (!prefix) string == `Your prefix is already at default.`;
        else string == `Prefix deleted! Default prefix: \`${config.PREFIX}\``;
        
        embed.setAuthor(`${client.user.tag}`, client.user.displayAvatarURL);
        embed.setColor(colors.red);
        embed.setDescription(`${string}`);
        embed.setTitle(`Guild prefix updated by ${msg.author.tag}`);
        embed.setTimestamp();

        server.server.prefix = config.PREFIX;

        await server.save();

        await msg.channel.send(embed);
        return true;
    }
}