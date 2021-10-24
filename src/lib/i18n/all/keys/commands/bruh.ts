import { FT, T } from "#lib/types";

export const NoMention = T<string>("commands/bruh:noMention");
export const Mention = FT<{ mention: string }, string>("commands/bruh:mention");