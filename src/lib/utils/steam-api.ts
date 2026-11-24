import { fetch } from "@sapphire/fetch";
import { envParseString } from "@skyra/env-utilities";
const playerSummaryUrl = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002";
const vanityUrl = "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1";
const gameServerQueryUrl = "https://api.steampowered.com/IGameServersService/QueryByFakeIP/v1";

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

  const result = await fetch<any>(`${vanityUrl}?${params.toString()}`);

  return result.response.steamid;
}

export async function getSdrServerInformation({ ip, port }: { ip: string; port: number }) {
  const params = new URLSearchParams();
  params.set("fake_ip", ipToInt(ip).toString());
  params.set("key", steamApiKey);
  params.set("fake_port", port.toString());
  params.set("app_id", "440");
  params.set("query_type", "1");

  const result = await fetch<any>(`${gameServerQueryUrl}?${params.toString()}`);

  if (!result) {
    throw new Error("Server does not exist");
  }

  const serverData = result.response.ping_data;

  return {
    name: serverData.server_name,
    map: serverData.map,
    players: `${serverData.num_players}/${serverData.max_players}`,
    stvPort: serverData.spectator_port,
  };
}

function ipToInt(ip: string) {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}
