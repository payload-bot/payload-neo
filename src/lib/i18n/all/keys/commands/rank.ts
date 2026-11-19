import { FT, T } from "#lib/types";

export const Name = T<string>("commands/rank:name");
export const Description = T<string>("commands/rank:description");
export const DetailedDescription = T<string>("commands/rank:detailedDescription");

export const RankString = FT<{ name: string; rank?: number; count: number }, string>("commands/rank:rank");
export const NoPushesYet = T<string>("commands/rank:noPushesYet");
