import { Client } from "../lib/types";
import { clearPingCache, clearSnipeCache } from "../util/snipe-cache";

export const every = 1000 * 60 * 5;

export async function run(client: Client) {
    Object.keys(client.cache.snipe).map(guild => clearSnipeCache(client, guild));
    Object.keys(client.cache.pings).map(guild => clearPingCache(client, guild));
}