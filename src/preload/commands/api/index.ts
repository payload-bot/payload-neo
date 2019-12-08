import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, RichEmbed } from "discord.js";
import colors from "../../../lib/misc/colors"

export default class Api extends Command {

    constructor() {
        super(
            "api",
            "A link to the api.",
            undefined,
            ["SEND_MESSAGES", "EMBED_LINKS"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        let embed = new RichEmbed();
        embed.setAuthor("TFBot", client.user.displayAvatarURL);
        embed.setColor(colors.yellow);
        embed.setTitle("API Website");
        embed.setDescription("API Can be accessed [here](http://bot.elo.associates/all-data).");
        await msg.channel.send(embed);
        return true;
    }
    
}