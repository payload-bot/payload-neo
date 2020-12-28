import SteamID from "steamid";
import axios from "axios";

export async function ensureSteamID(id: string): Promise<string | undefined> {
	let steamID: SteamID;

	if (!id.length) return undefined;

	try {
		steamID = new SteamID(id);
	} catch (err) {
		try {
			const { data } = await axios(`https://steamcommunity.com/id/${id}`, { responseType: "text" });

			const cssSteamID = data.match(/(765611\d{11})/);

			if (!cssSteamID) return undefined;

			id = (cssSteamID[0].match(/(765611\d{11})/) as RegExpMatchArray)[0];

			return id;
		} catch (err) {
			return undefined;
		}
	}

	if (!steamID.isValid()) return undefined;

	return steamID.getSteamID64();
}
