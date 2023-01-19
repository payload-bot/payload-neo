import type { LeagueProfile } from "#lib/types/playercheck/leagueProfile.js";
import { RESOLVER } from "awilix";

export class PlayerCheckProvider {
  static [RESOLVER] = {};

  constructor(private etf2lApiProvider: LeagueInformationProvider, private rglApiProvider: LeagueInformationProvider) {}

  async getPlayerInformation(steamId: string): Promise<Array<LeagueProfile | null>> {
    const combinedProfiles = await Promise.all([
      this.etf2lApiProvider.getPlayerInformation(steamId),
      this.rglApiProvider.getPlayerInformation(steamId),
    ]);

    return combinedProfiles;
  }
}

export interface LeagueInformationProvider {
  getPlayerInformation(steamId: string): Promise<LeagueProfile | null>;
}
