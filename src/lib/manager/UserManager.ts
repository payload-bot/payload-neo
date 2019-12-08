import * as Discord from "discord.js";
import { query, close } from "../../util/database";

export default class UserManager {
    client: Discord.Client;

    constructor(client: Discord.Client) {
        this.client = client;
    }

    async setSteamID(msg: Discord.Message, id: string) {
        msg.channel.startTyping();
        let rows = await query(`SELECT * FROM steamID WHERE id = '${msg.author.id}'`);
        if (!rows.length) await query(`INSERT INTO steamID (id, tag, steamid) VALUES ('${msg.author.id}', '${msg.author.tag}', '${id}')`);
        else await query(`UPDATE steamID SET steamid = '${id}' WHERE id = '${msg.author.id}'`);
        await close();
        console.log(`Added ${msg.author.tag} to my database with steamid of ${id}`);
        msg.channel.stopTyping(true);
    }

    async findUser(msg: Discord.Message): Promise<string | boolean> {
        let targetUser = msg.mentions.users.first() || msg.author;
        let rows = await query(`SELECT * FROM steamID WHERE id = '${targetUser.id}'`);
        await close();
        if (!rows.length) return false;
        let steamid: string = rows[0].steamid;
        return steamid;
    }

    async getUserLevel(id: string): Promise<number> {
        let rows = await query(`SELECT * FROM changelog_configuration WHERE id = '${id}'`);
        await close();
        if (!rows.length) {
            await query(`INSERT INTO changelog_configuration (id, level) VALUES ('${id}', '2')`);
            let rows = await query(`SELECT * FROM changelog_configuration WHERE id = '${id}'`);
            await close();
            return rows[0].level as number;
        } else return rows[0].level as number;
    }

    async setNotifLevel(user: Discord.User, level: string): Promise<boolean> {
        let rows = await query(`SELECT * FROM changelog_configuration WHERE id='${user.id}'`);
        if (!rows.length) await query(`INSERT INTO changelog_configuration (id, tag, level) VALUES ('${user.id}', '${user.tag}', '${level}')`);
        else await query(`UPDATE changelog_configuration SET level = '${level}' WHERE id = '${user.id}'`);
        await close();
        return true;
    }
}