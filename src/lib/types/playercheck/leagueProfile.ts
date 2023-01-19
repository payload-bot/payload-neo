export type LeagueProfile = {
  provider: string;
  steamId: string;
  avatar: string;
  alias: string;
  banInformation: {
    isBanned: boolean;
    endsAt: Date | null;
    reason: string | null;
  };
};
