import SteamID from "steamid";

/**
 * @param ID
 * @type String
 * @returns SteamID64
 */
export default (ID: string): string => {
    if (ID.startsWith("U")) ID = `[${ID}]`

    let steamId: SteamID;
    try {
        steamId = new SteamID(ID);
    } catch (err) {
        return "ERROR";
    }

    if (!steamId.isValid()) {
        return "INVALID";
    }

    const id64 = steamId.getSteamID64();

    return id64;
}