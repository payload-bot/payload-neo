import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, RichEmbed } from "discord.js";
import config from "../../../config";
import colors from "../../../lib/misc/colors"

export default class Profile extends Command {
    constructor() {
        super(
            "profile",
            "Gets user's profile.",
            [
                {
                    name: "user mention",
                    description: "User's profile to get.",
                    required: false,
                    type: "string"
                }
            ]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        let profile = msg.mentions.users.first() || msg.author;
        const user = await client.userManager.getUser(profile.id);

        const embed = new RichEmbed();
        embed.setAuthor(`${profile.username}`, profile.displayAvatarURL);
        embed.addField("Bot: ", `${(profile.bot) ? "Yes" : "No"}`);
        embed.addField('ID: ', profile.id);
        embed.addField('SteamID: ', user.user.steamID || "NOT SET");
        embed.addField('Points: ', user.getFeetPushed());
        embed.setColor(colors.blue);
        await msg.channel.send(embed);

        return true;
    }
}