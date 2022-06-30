import { T, FT } from "#lib/types";

export const Description = T<string>("commands/pushcart:description");
export const DetailedDescription = T<string>("commands/pushcart:detailedDescription");

export const Cooldown = FT<{ seconds: string }, string>("commands/pushcart:cooldown");
export const Maxpoints = FT<{ expires: string }, string>("commands/pushcart:maxpoints");
export const PushSuccess = FT<{ units: string; total: string }, string>("commands/pushcart:pushSuccess");

export const NoAmount = T<string>("commands/pushcart:noAmount");
export const NoTargetUser = T<string>("commands/pushcart:noTargetUser");
export const NotEnoughCreds = T<string>("commands/pushcart:notEnoughCreds");
export const GiftSuccess = FT<{ from: string; to: string }, string>("commands/pushcart:giftSuccess");

export const LeaderboardEmbedTitle = T<string>("commands/pushcart:leaderboardEmbedTitle");
export const ServerEmbedTitle = T<string>("commands/pushcart:serverEmbedTitle");
