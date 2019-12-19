import { Client } from "../lib/types";
import { initPrefixCache } from "../util/prefix";
import { close } from "../util/database";

export const every = 1000 * 60 * 15; // 5 mins

export async function run(client: Client) {
    console.log("Caching prefixes...");
    client.cache.prefix = {};
    initPrefixCache();
    await close();
    console.log("Updated prefixes.");
}