import client from "../..";

export async function getDiscordUser(discordId: string) {
    return client.users.cache.get(discordId) ?? (await client.users.fetch(discordId));
}
