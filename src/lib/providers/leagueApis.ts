export abstract class LeagueApiProvider {
  constructor(public type: string) {}
}

export type BanResult = {
  isBanned: boolean;
  reason: string | null;
  bannedUntil: Date | null;
};

export interface LeagueBanProvider {
  getPlayerBans(steamId: string): Promise<BanResult>;
}
