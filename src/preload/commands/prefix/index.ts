import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types";
import { Message, RichEmbed } from "discord.js";
import { query } from "../../../util/database";
import colors from "../../../lib/misc/colors"
import { clearPrefix, addPrefix } from "../../../util/prefix";
import config from "../../../config";

export default class Prefix extends Command {
    constructor() {
        super(
            "prefix",
            "Sets the guild-specific prefix.",
            [
                {
                    name: "command",
                    description: "Command of prefix to execute",
                    required: true,
                    type: "string",
                    options: ["set", "delete", "show"]
                },
                {
                    name: "new prefix",
                    description: "Your new prefix",
                    required: false,
                    type: "string",
                }
            ],
            undefined,
            ["ADMINISTRATOR"],
            ["text"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        let args: any = await this.parseArgs(msg);
        let embed = new RichEmbed();
        let string: string;

        if (!args[1] && args[0] === "set") return await this.fail(msg, "I need to know your prefix that you want to set!");
        let newPrefix = (await this.getArgs(msg, 1)).join(" ").replace(/ +/, ".");

        const rows = await query(`SELECT * FROM prefix WHERE guild='${msg.guild.id}'`);

        if (args[0] === "show") {
            const prefix = rows[0].prefix;
            (rows.length) ? this.respond(msg, `This guild's prefix is: \"${prefix.replace(".", " ")}\"`) : this.respond(msg, `This guild's prefix is: \"${config.PREFIX}\"`);
            return true;
        }

        if (args[0] === "set") {
            (rows.length) ? await query(`UPDATE prefix SET prefix='${newPrefix}' WHERE guild='${msg.guild.id}'`) : await query(`INSERT INTO prefix(guild, prefix) VALUES ('${msg.guild.id}','${newPrefix}')`);
            string = `Your new prefix is: \'${newPrefix.replace(".", " ")}\'\nIf you need spaces your prefix instead, please use \" \"`;
            addPrefix(msg.guild.id, newPrefix.replace(".", " "));
        }
        else if (args[0] === "delete") {
            await query(`DELETE FROM prefix WHERE guild='${msg.guild.id}'`);
            string = "Prefix deleted. Default: !";
            clearPrefix(msg.guild.id);
        }

        embed.setAuthor("TFBot", client.user.displayAvatarURL);
        embed.setColor(colors.red);
        embed.setDescription(`${string}`);
        embed.setTitle(`Guild prefix updated by ${msg.author.tag}`);
        embed.setTimestamp();

        if (string) await msg.channel.send(embed);
        return true;
    }
}