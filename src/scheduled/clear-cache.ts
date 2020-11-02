import { Client } from "../lib/types";
import { clearSnipeCache } from "../util/snipe-cache";

export const every = 1000 * 60 * 5;

export async function run(client: Client) {
    Object.keys(client.cache.snipe).map(guild => clearSnipeCache(client, guild));
}