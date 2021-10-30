import { FT, T } from "#lib/types";

export const NoMessages = T<string>("commands/snipe:noMessages");
export const AboveCacheAmount = FT<{ count: number }, string>("commands/snipe:aboveCacheAmount");
