import { fetch } from "@sapphire/fetch";

const url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002";

export async function getSteamProfileInformation(steamId: string): Promise<any> {
  const params = new URLSearchParams();
  params.set("key", process.env.STEAM_API_KEY!);
  params.set("steamids", steamId);

  const result = await fetch(`${url}?${params.toString()}`);

  return result;
}
