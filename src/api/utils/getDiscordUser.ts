import client from "../..";

export async function getDiscordUser(discordId: string) {
  return await client.users.fetch(discordId);
}
