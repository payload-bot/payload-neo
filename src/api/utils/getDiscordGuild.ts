import client from "../..";

export default async function getDiscordGuild(guildId: string) {
  return await client.guilds.fetch(guildId);
}
