import { RichEmbed } from "discord.js";
import { Client } from "../lib/types";
import sleep from "./sleep";

export async function pushNotification(client: Client, id: string, level: number, embed: RichEmbed, version?: string): Promise<boolean> {
    const userDBEntry = await client.userManager.getUserLevel(id);
    
    if (userDBEntry < level) return false;

    let discordUser = client.users.get(id);
    if (!discordUser) discordUser = await client.fetchUser(id);

    try {
        await discordUser.send(embed);
    } catch (err) {
        console.warn(err);
    }
    
    await await sleep(5);
    return true;
}