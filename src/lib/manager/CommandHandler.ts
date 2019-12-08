import { Client } from "../types/Client";
import { Message, PermissionResolvable, TextChannel, Permissions } from "discord.js";
import config from "../../config";
import { Command } from "../exec/Command";

export default async function handleCommand(client: Client, msg: Message): Promise<Boolean> {

    if (msg.author.bot) return false;

    if (!msg.content.toLowerCase().startsWith(config.PREFIX)) return false;

    let command = msg.content.slice(config.PREFIX.length).trim().split(" ")[0];

    if (!client.commands.has(command)) return false;

    let executableCommand = client.commands.get(command) as Command;

    if (executableCommand.requiresRoot && msg.author.id != config.allowedID) return false;

    if (!executableCommand.zones.includes(msg.channel.type)) return false;

    if (msg.channel.type == "text") {
        const guild = msg.guild.id;

        let serverManager = client.serverManager;
        //let channels = await serverManager.getChannel(guild);

        //await serverManager.addCommandRestrictions(msg.guild.id, ["649767467719196672","649767410282266665"], ["profile", "log", "commands", "test"]);
        

        //if ((commandRestrictions as Array<string>).includes(executableCommand.name)) return false;

        let canBeExecutedBy = executableCommand.canBeExecutedBy as PermissionResolvable;
        let permissionsNeeded = executableCommand.permissions as PermissionResolvable;

        if (!((msg.channel as TextChannel).permissionsFor(msg.author) as Permissions).has(canBeExecutedBy)) return false;

        if (!((msg.channel as TextChannel).permissionsFor(client.user) as Permissions).has(permissionsNeeded)) return false;
    }

    try {
        await executableCommand.run(client, msg);
        console.log(`User ${msg.author.id}/${msg.author.tag} used command ${executableCommand.name}.`);
    } catch (err) {
        console.warn("Error while executing command " + command, err);
    }

    msg.channel.stopTyping(true);
    return true;
}