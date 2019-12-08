import SteamID from "steamid";
import got from "got";

export async function ensureSteamID(id: string): Promise<string | undefined> {
    let steamID: SteamID;

    if (id.length == 0) return undefined;

    try {
        steamID = new SteamID(id);
    } catch (err) {
        try {
            let steamPage = await got("https://steamcommunity.com/id/" + id);
            let body = steamPage.body;

            let cssSteamID = body.match(/id="commentthread_Profile_\d+_area">/);

            if (!cssSteamID) return undefined;

            id = (cssSteamID[0].match(/\d+/) as RegExpMatchArray)[0];

            return id;
        } catch (err) {
            return undefined;
        }
    }

    if (!steamID.isValid()) return undefined;

    return steamID.getSteamID64();
}