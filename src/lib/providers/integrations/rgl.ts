import { Export } from "#lib/dependencyInjection/export";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import type { LeagueInformationProvider } from "../leagueApis.js";

@Export({
  name: "rglApiProvider",
})
export class RglApiIntegration implements LeagueInformationProvider {
  #baseUrl = "https://api.rgl.gg/v0";
  #provider = "rgl";

  async getPlayerInformation(steamId: string) {
    const url = `${this.#baseUrl}/profile/${steamId}`;

    const headers = new Headers([["User-Agent", "Payload Client (version 1.0.0)"]]);

    const response = await fetch(url, { headers }, FetchResultTypes.Result);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as RglProfileResponse;

    return {
      steamId,
      provider: this.#provider,
      alias: data.name,
      avatar: data.avatar,
      banInformation: {
        endsAt: data.banInformation?.endsAt ?? null,
        isBanned: data.status.isBannned,
        reason: data.banInformation?.reason ?? null,
      },
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
