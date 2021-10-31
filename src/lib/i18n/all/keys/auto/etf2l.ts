import { FT, T } from "#lib/types";

export const Description = T<string>("auto/etf2l:description");
export const EmbedTitle = T<string>("auto/etf2l:embedTitle");
export const EmbedFooter = FT<{name: string }, string>("auto/etf2l:embedFooter");
