import { query, close } from "./database";
import client from "../client";
export async function initPrefixCache() {
    let prefixArray: Array<any> = await query(`SELECT * FROM prefix`);
    await close();

    for (let i in prefixArray) {
        let spacePrefix: string = prefixArray[i].prefix;
        spacePrefix = spacePrefix.replace(".", " ");
        client.cache.prefix[prefixArray[i].guild] = spacePrefix;
    }
}

export async function clearPrefix(guild: string) {
    delete client.cache.prefix[guild];
}

export async function addPrefix(guild: string, prefix: string) {
    client.cache.prefix[guild] = prefix;
}

export function getPrefixFromCache(guild: string) {
    if (!client.cache.prefix[guild]) client.cache.prefix[guild] = "!";
    return client.cache.prefix[guild];
}