import SteamID from "steamid";

/**
 * @param {string} idToTest
 */
export default (idToTest: string): string => {
	const validIdTest = /(765611\d{11})|(STEAM_[01]\:[01]\:\d{8})|(\[U\:[01]\:\d{9}\])/gi;

	const isValid = idToTest.match(validIdTest);

	if (!isValid) return undefined;

	let steamId: SteamID;
	try {
		steamId = new SteamID(idToTest);
	} catch (err) {
		return undefined;
	}

	if (!steamId.isValid()) {
		return undefined;
	}

	const id64 = steamId.getSteamID64();

	return id64;
};
