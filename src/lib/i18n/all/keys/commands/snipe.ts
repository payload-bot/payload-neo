import { FT, T } from "#lib/types";

export const Description = T<string>("commands/snipe:description");
export const DetailedDescription = T<string>("commands/snipe:detailedDescription");
export const NoMessages = T<string>("commands/snipe:noMessages");
export const AboveCacheAmount = FT<{ count: number }, string>("commands/snipe:aboveCacheAmount");
