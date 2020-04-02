import { Command } from "../../../../lib/exec/Command";
import { Client } from "../../../../lib/types";
import { Message, MessageEmbed } from "discord.js";
import colors from "../../../../lib/misc/colors";

export default class Set extends Command {
    constructor() {
        super(
            "set",
            "Sets guild language",
            [
                {
                    name: "language",
                    description: "Your new guild language",
                    required: true,
                    type: "string",
                    options: ['en-US']
                }
            ],
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            ["language"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        let embed = new MessageEmbed();
        const args: any = await this.parseArgs(msg, 2);
        const lang = await this.getLanguage(msg);

        if (args === false) return false
        
        const newlang = args && args[0];
        if (!newlang) return await this.fail(msg, lang.language_set_fail_nonew);

        const server = await client.serverManager.getServer(msg.guild.id);
        let oldlang = server.getLanguageFromGuild(msg.guild.id);

        if (oldlang === newlang) return await this.fail(msg, lang.language_set_fail_oldnew);

        embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL());
        embed.setColor(colors.red);
        embed.setDescription(lang.language_set_success_embeddesc.replace('%langauge', newlang));
        embed.setTitle(lang.language_set_success_embedtitle.replace('%author', msg.author.id));
        embed.setTimestamp();

        server.server.language = newlang;

        await server.save();

        await msg.channel.send(embed);
        return true;
    }
}