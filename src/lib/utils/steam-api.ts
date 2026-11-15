import { fetch } from "@sapphire/fetch";
import { envParseString } from "@skyra/env-utilities";

const playerSummaryUrl = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002";
const vanityUrl = "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1";
const steamApiKey = envParseString("STEAM_API_KEY");

export async function getSteamProfileInformation(steamId: string): Promise<any> {
  const params = new URLSearchParams();
  params.set("key", steamApiKey);
  params.set("steamids", steamId);

  const result = await fetch(`${playerSummaryUrl}?${params.toString()}`);

  return result;
}

export async function resolveVanityId(name: string): Promise<any> {
  const params = new URLSearchParams();
  params.set("key", steamApiKey);
  params.set("vanityurl", name);

  const result = await fetch(`${vanityUrl}?${params.toString()}`);

  return (result as any).response.steamid;
}
