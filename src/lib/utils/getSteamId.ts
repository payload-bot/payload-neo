import { ID } from "@node-steam/id";
import { isNullishOrEmpty } from "@sapphire/utilities";
import { resolveVanityId } from "./steam-api.ts";

/**
 * Tests and retrieves an ID64 from a string
 * @param id SteamId to test
 * @returns {string|null} Result
 */
export async function getSteamIdFromArgs(id: string): Promise<ID | null> {
  if (isNullishOrEmpty(id)) {
    return null;
  }

  let steamID: ID;

  try {
    steamID = new ID(id);
  } catch {
    try {
      const data = await resolveVanityId(id);

      if (!data) {
        return null;
      }

      return new ID(data);
    } catch {
      return null;
    }
  }

  if (!steamID.isValid()) {
    return null;
  }

  return steamID;
}
