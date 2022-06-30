import { FT, T } from "#lib/types";

export const Description = T<string>("commands/bruh:description");
export const DetailedDescription = T<string>("commands/bruh:detailedDescription");
export const NoMention = T<string>("commands/bruh:noMention");
export const Mention = FT<{ mention: string }, string>("commands/bruh:mention");
