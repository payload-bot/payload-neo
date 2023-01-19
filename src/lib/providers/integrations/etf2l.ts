import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { RESOLVER } from "awilix";
import type { LeagueInformationProvider } from "../leagueApis.js";

export class Etf2lApiIntegration implements LeagueInformationProvider {
  static [RESOLVER] = {
    name: "etf2lApiProvider",
  };

  #baseUrl = "https://api-v2.etf2l.org";
  #provider = "etf2l";

  async getPlayerInformation(steamId: string) {
    const url = `${this.#baseUrl}/player/${steamId}`;

    const headers = new Headers([["User-Agent", "Payload Client (version 1.0.0)"]]);

    const response = await fetch(url, { headers }, FetchResultTypes.Result);

    if (!response.ok) {
      return null;
    }

    const { player } = (await response.json()) as Etf2lProfileResponse;

    return {
      steamId,
      alias: player.name,
      avatar: player.steam.avatar,
      provider: this.#provider,
      banInformation: {
        endsAt: null,
        isBanned: player.bans != null,
        reason: null,
      },
    };
  }
}

type Etf2lProfileResponse = {
  player: {
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
};
