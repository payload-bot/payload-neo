import { fetch } from "@sapphire/fetch";
import { envParseString } from "@skyra/env-utilities";

const url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002";
const steamApiKey = envParseString("STEAM_API_KEY");

export async function getSteamProfileInformation(steamId: string): Promise<any> {
  const params = new URLSearchParams();
  params.set("key", steamApiKey);
  params.set("steamids", steamId);

  const result = await fetch(`${url}?${params.toString()}`);

  return result;
}
