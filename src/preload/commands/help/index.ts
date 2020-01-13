import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message, RichEmbed } from "discord.js";

export default class Help extends Command {
    constructor() {
        super(
            "help",
            "Find out how to use commands.",
            [
                {
                    name: "command",
                    description: "The name of the command to view information on.",
                    required: true,
                    type: "string"
                },
                {
                    name: "subcommand",
                    description: "Subcommand to view information on.",
                    required: false,
                    type: "string"
                }
            ]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const args  = await this.parseArgs(msg);

        if (args === false) {
            return false;
        }

        const commandName = (args[0] as String).toLowerCase();
        const subcommandNames = args.slice(1) as String[];

        if (!commandName || !client.commands.has(commandName)) {
            return false;
        }

        let command = client.commands.get(commandName)!;

        let usage: string;
        let permissionsNeeded: {
            user: string[],
            client: string[]
        } = {
            user: [],
            client: []
        };

        if (subcommandNames) {
            for (let i = 0; i < subcommandNames.length; i++) {
                command = command.subCommands[subcommandNames[i].toLowerCase()];

                if (!command) {
                    return false;
                }
            }
        }

        usage = await command.getUsage(msg);
        permissionsNeeded = {
            user: command.canBeExecutedBy,
            client: command.permissions
        };

        let helpEmbed = new RichEmbed();
            helpEmbed.setTitle(command.name);
            helpEmbed.setDescription(`${command.description}`);
            helpEmbed.addField("Usage", usage);
            helpEmbed.addField("Permissions Needed", `\`\`\`md\n# For User #\n${permissionsNeeded.user.join("\n")}\n\n# For ${client.user.username} #\n${permissionsNeeded.client.join("\n")}\n\`\`\``);
            if (command.getSubcommandArray().length > 0) {
                helpEmbed.addField("Subcommands", command.getSubcommandArray().join(", "));
            }
            helpEmbed.setFooter(`Requested by: ${msg.author.tag}. For a full list of commands: \`${await this.getPrefix(msg)}commands\``);
            helpEmbed.setColor(16098851);

        await msg.channel.send(helpEmbed);

        return true;
    }
}