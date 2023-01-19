import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { BanResult, LeagueApiProvider, LeagueBanProvider } from "../leagueApis.js";

export class RglApiIntegration extends LeagueApiProvider implements LeagueBanProvider {
  #baseUrl = "https://api.rgl.gg/v0";

  constructor() {
    super("RGL");
  }

  async getPlayerBans(steamId: string): Promise<BanResult> {
    const url = `${this.#baseUrl}/profile/${steamId}`;

    const headers = new Headers([["User-Agent", "Payload Client (version 1.0.0)"]]);

    const response = await fetch<RglProfileResponse>(url, { headers }, FetchResultTypes.JSON);

    return {
      bannedUntil: response.banInformation?.endsAt ?? null,
      isBanned: response.status.isBannned,
      reason: response.banInformation?.reason ?? null,
    };
  }
}

type RglProfileResponse = {
  steamId: string;
  avatar: string;
  name: string;
  updatedAt: string;
  status: {
    isVerified: boolean;
    isBannned: boolean;
    isOnProbation: boolean;
  };
  banInformation: {
    endsAt: Date;
    reason: string;
  } | null;
};
