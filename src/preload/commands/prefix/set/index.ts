import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message, MessageEmbed } from "discord.js";
import colors from "../../../../lib/misc/colors";

export default class Set extends Command {
    constructor() {
        super(
            "set",
            "Sets guild prefix",
            [
                {
                    name: "prefix",
                    description: "Your new guild prefix",
                    required: true,
                    type: "string",
                }
            ],
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            ["prefix"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args: any = await this.parseArgs(msg, 2);
        const lang = await this.getLanguage(msg);

        if (args === false) return false
        const newPrefix = args && args[0];
        if (!newPrefix) return await this.fail(msg, lang.prefix_set_fail_nonew);

        const server = await client.serverManager.getServer(msg.guild.id);
        let oldPrefix = server.getPrefixFromGuild(msg.guild.id);

        if (oldPrefix === newPrefix) return await this.fail(msg, lang.prefix_set_fail_oldnew);
        
        let embed = new MessageEmbed();
        embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL());
        embed.setColor(colors.red);
        embed.setDescription(lang.prefix_set_success_embeddesc.replace('%prefix', newPrefix));
        embed.setTitle(lang.prefix_set_success_embedtitle.replace('%author', msg.author.tag));
        embed.setTimestamp();

        server.server.prefix = newPrefix;

        await server.save();

        await msg.channel.send(embed);
        return true;
    }
}