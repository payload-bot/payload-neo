import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { ID } from "@node-steam/id";
import { isNullishOrEmpty } from "@sapphire/utilities";

/**
 * Tests and retrieves an ID64 from a string
 * @param id SteamId to test
 * @returns {string|null} Result
 */
export async function getSteamIdFromArgs(id: string) {
  if (isNullishOrEmpty(id)) {
    return null;
  }

  let steamID: ID;

  try {
    steamID = new ID(id);
  } catch {
    try {
      const data = await fetch(`https://steamcommunity.com/id/${id}`, FetchResultTypes.Text);

      const cssSteamID = data.match(/(765611\d{11})/);

      if (!cssSteamID) {
        return null;
      }

      return (cssSteamID[0].match(/(765611\d{11})/) as RegExpMatchArray)[0];
    } catch {
      return null;
    }
  }

  if (!steamID.isValid()) {
    return null;
  }

  return steamID.getSteamID64();
}

/**
 * Tests and retrieves an ID64 from a URL
 * @param id SteamId to test
 * @returns {string|null} Result
 */
export async function getSteamIdFromUrl(url: string): Promise<ID | null> {
  if (isNullishOrEmpty(url)) {
    return null;
  }

  try {
    const data = await fetch(url, FetchResultTypes.Text);

    const cssSteamID = data.match(/(765611\d{11})/);

    if (!cssSteamID || cssSteamID?.length == 0) {
      return null;
    }

    try {
      const id = new ID(cssSteamID[0]);
      return id;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}
