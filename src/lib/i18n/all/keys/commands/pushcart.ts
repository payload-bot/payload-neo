import { T, FT } from "#lib/types";

export const Description = T<string>("commands/pushcart:description");
export const DetailedDescription = T<string>("commands/pushcart:detailedDescription");

export const Cooldown = FT<{ seconds: string }, string>("commands/pushcart:cooldown");
export const Maxpoints = FT<{ expires: string }, string>("commands/pushcart:maxpoints");
export const PushSuccess = FT<{ units: string; total: string }, string>("commands/pushcart:pushSuccess");

export const StatsTitle = FT<{ leaderboardString: string }, string>("commands/pushcart:statsTitle");
export const TopPushers = FT<{ leaderboardString: string }, string>("commands/pushcart:topPushers");
export const ActivePushers = FT<{ leaderboardString: string }, string>("commands/pushcart:activePushers");

export const TotalUnitsPushedTitle = FT<{ leaderboardString: string }, string>("commands/pushcart:totalUnitsPushedTitle");
export const TotalUnitsPushed = FT<{ leaderboardString: string }, string>("commands/pushcart:totalUnitsPushed");
export const TotalPushedTitle = FT<{ leaderboardString: string }, string>("commands/pushcart:totalPushedTitle");
export const TotalPushed = FT<{ leaderboardString: string }, string>("commands/pushcart:totalPushed");
export const DistinctPushersTitle = FT<{ leaderboardString: string }, string>("commands/pushcart:distinctPushersTitle");
export const DistinctPushers = FT<{ leaderboardString: string }, string>("commands/pushcart:distinctPushers");

export const RankString = FT<{ name: string, rank?: number, count: number }, string>("commands/pushcart:rank");
export const NoPushesYet = T<string>("commands/pushcart:noPushesYet");

export const LeaderboardEmbedTitle = T<string>("commands/pushcart:leaderboardEmbedTitle");
export const ServerEmbedTitle = T<string>("commands/pushcart:serverEmbedTitle");
