import { query } from "../../util/database";
import client from "../../client";
import config from "../../config";

export default async function getGuildPrefix(id: string): Promise<string> {
    if (client.cache.prefix[id]) return client.cache.prefix[id]
    let rows = await query(`SELECT * FROM prefix WHERE guild='${id}'`);
    if (!rows.length) return config.PREFIX as string;
    let prefix = rows[0].prefix.replace(".", " ");
    return prefix;
}