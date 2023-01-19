import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { BanResult, LeagueApiProvider, LeagueBanProvider } from "../leagueApis.js";

export class Etf2lApiIntegration extends LeagueApiProvider implements LeagueBanProvider {
  #baseUrl = "https://api-v2.etf2l.org";

  constructor() {
    super("ETF2L");
  }

  async getPlayerBans(steamId: string): Promise<BanResult> {
    const url = `${this.#baseUrl}/player/${steamId}`;

    const headers = new Headers([["User-Agent", "Payload Client (version 1.0.0)"]]);

    const response = await fetch<Etf2lProfileResponse>(url, { headers }, FetchResultTypes.JSON);

    return {
      bannedUntil: null,
      isBanned: response.bans != null,
      reason: null,
    };
  }
}

type Etf2lProfileResponse = {
  id: number;
  name: string;
  steam: {
    avatar: string;
  };
  title: string;
  bans: {
    endsAt: Date;
    reason: string;
  } | null;
};
