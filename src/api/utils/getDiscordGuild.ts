import client from "../..";

export async function getDiscordGuild(guildId: string) {
  return (
    client.guilds.cache.get(guildId) ?? (await client.guilds.fetch(guildId))
  );
}
