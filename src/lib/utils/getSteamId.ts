import axios from "axios";
import SteamID from "steamid";

/**
 * Tests and retrieves an ID64 from a string
 * @param id SteamId to test
 * @returns {string|null} Result
 */
export async function getSteamIdFromArgs(id: string) {
  let steamID: SteamID;

  if (!!id) return null;

  try {
    steamID = new SteamID(id);
  } catch (err) {
    try {
      const { data } = await axios.get<string>(
        `https://steamcommunity.com/id/${id}`,
        { responseType: "text" }
      );

      const cssSteamID = data.match(/(765611\d{11})/);

      if (!cssSteamID) return null;

      id = (cssSteamID[0].match(/(765611\d{11})/) as RegExpMatchArray)[0];

      return id;
    } catch (err) {
      return null;
    }
  }

  if (!steamID.isValid()) return null;

  return steamID.getSteamID64();
}
