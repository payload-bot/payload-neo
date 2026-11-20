import { FT, T } from "#lib/types";

export const Name = T<string>("commands/stats:name");
export const Description = T<string>("commands/stats:description");
export const DetailedDescription = T<string>("commands/stats:detailedDescription");

export const StatsTitle = FT<{ leaderboardString: string }, string>("commands/stats:statsTitle");
export const TopPushers = FT<{ leaderboardString: string }, string>("commands/stats:topPushers");
export const ActivePushers = FT<{ leaderboardString: string }, string>("commands/stats:activePushers");

export const TotalUnitsPushedTitle = FT<{ leaderboardString: string }, string>(
  "commands/stats:totalUnitsPushedTitle",
);
export const TotalUnitsPushed = FT<{ leaderboardString: string }, string>("commands/stats:totalUnitsPushed");
export const TotalPushedTitle = FT<{ leaderboardString: string }, string>("commands/stats:totalPushedTitle");
export const TotalPushed = FT<{ leaderboardString: string }, string>("commands/stats:totalPushed");
export const DistinctPushersTitle = FT<{ leaderboardString: string }, string>("commands/stats:distinctPushersTitle");
export const DistinctPushers = FT<{ leaderboardString: string }, string>("commands/stats:distinctPushers");

export const RankString = FT<{ name: string; rank?: number; count: number }, string>("commands/stats:rank");
export const NoPushesYet = T<string>("commands/stats:noPushesYet");
