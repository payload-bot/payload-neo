import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, MessageEmbed } from "discord.js";
import axios from "axios";
import Language from "../../../lib/types/Language";
import PayloadColors from "../../../lib/misc/colors";

export default class Profile extends Command {
    apiAddress: string;

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

        this.apiAddress = "https://payload.tf";
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const lang: Language = await this.getLanguage(msg);
        const profile = msg.mentions.users.first() || msg.author;
        const user = await client.userManager.getUser(profile.id);
        const steamid = user.user.steamID;

        msg.channel.startTyping();

        // Validate everything, because we want to do conditional rendering without doing try-catches
        const { data, status } = await axios(`${this.apiAddress}/api/external/rgl/${user.user.steamID}`, { validateStatus: () => true });

        let description =  `
            Bot: ${(profile.bot) ? "Yes" : "No"}
            ID: ${profile.id}
            Steam ID: ${steamid || "NOT SET"}\n`

        if(status === 200) description += `RGL Profile: [here](http://rgl.gg/Public/PlayerProfile.aspx?p=${data.steamid})\n`;
        description +=`${lang.profile_points}: ${user.getFeetPushed()}`;

        const embed = new MessageEmbed({
            title: profile.tag,
            description,
            color: PayloadColors.USER,
            thumbnail: {
                url: profile.displayAvatarURL()
            }
        });

        await msg.channel.send(embed);
        msg.channel.stopTyping(true)

        return true;
    }
}