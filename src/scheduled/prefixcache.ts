import { Client } from "../lib/types";
import client from "../client";
import { initPrefixCache } from "../util/prefix";

export const every = 1000 * 60 * 15; // 5 mins

export async function run(client: Client) {
    console.log("Caching prefixes...");
    client.cache.prefix = {};
    initPrefixCache();
    console.log("Updated prefixes.");
}