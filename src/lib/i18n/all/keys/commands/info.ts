import { T, FT } from "#lib/types";

export const EmbedTitle = FT<{ users: number, servers: number }, string>("commands/info:title");
export const EmbedDescription = T<string>("commands/info:description");