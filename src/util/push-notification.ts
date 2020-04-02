import { MessageEmbed } from "discord.js";
import { Client } from "../lib/types";

export async function pushNotification(client: Client, id: string, level: number, embed: MessageEmbed, version?: string): Promise<boolean> {
    const userDBEntry = await client.userManager.getUser(id);

    if (userDBEntry.user.notificationsLevel == undefined) {
        userDBEntry.user.notificationsLevel = 2;
    }
    if (userDBEntry.user.latestUpdateNotifcation == undefined) {
        userDBEntry.user.latestUpdateNotifcation = "0.0.0";
    }

    if (userDBEntry.user.notificationsLevel < level) {
        return false;
    }

    if (version && userDBEntry.user.latestUpdateNotifcation == version) {
        await userDBEntry.save();

        return false;
    }

    let discordUser = client.users.cache.get(id);
    if (!discordUser) {
        discordUser = await client.users.fetch(id);
    }

    try {
        await discordUser.send(embed);
    } catch (err) {
        console.warn(err);
    }

    if (version) {
        userDBEntry.user.latestUpdateNotifcation = version;
    }

    await userDBEntry.save();

    return true;
}