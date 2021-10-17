import { container } from "@sapphire/framework";

const client = container.client;

const PAYLOAD_DISCORD_ID = process.env.PAYLOAD_DISCORD_ID as string;

async function fetchUser(discordId: string) {
  const discord = await client.guilds.fetch(PAYLOAD_DISCORD_ID);
  return await discord.members.fetch(discordId);
}

export async function isBetaTester(discordId: string) {
  try {
    const userInDiscord = await fetchUser(discordId);

    if (!userInDiscord) return false;

    const userHasBetaRole =
      userInDiscord.roles?.cache?.find((r) => r.name === "Beta Tester") ??
      false;

    if (!userHasBetaRole) return false;

    return true;
  } catch (ex) {
    return false;
  }
}

export async function isInPayloadDiscord(discordId: string) {
  try {
    const isUserInServer = await fetchUser(discordId);

    if (!isUserInServer) return false;

    return true;
  } catch (ex) {
    return false;
  }
}
