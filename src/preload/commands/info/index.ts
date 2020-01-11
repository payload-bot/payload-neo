import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, RichEmbed } from "discord.js";
import config from "../../../config";
import colors from "../../../lib/misc/colors"
import { version } from "../../../util/version_control";

export default class Info extends Command {
    constructor() {
        super(
            "info",
            "Gets client info."
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const embed = new RichEmbed();
            embed.setAuthor(`${client.user.username}`, client.user.avatarURL);
            embed.setTitle(`Currently serving **${client.users.size}** users in **${client.guilds.size}** servers!`);
            embed.setDescription(`Join the official ${client.user.username} discord server for help and suggestions: https://discord.gg/gYnnMYz\n\nInvite ${client.user.username} to your server with \`${await this.getPrefix(msg)}invite\`!`);
            embed.setFooter(`Created by ${(client.users.get(config.allowedID)!).tag} | Version ${version}`, (client.users.get(config.allowedID)!).avatarURL);
            embed.setColor(colors.yellow);
        await msg.channel.send(embed);

        return true;
    }
}