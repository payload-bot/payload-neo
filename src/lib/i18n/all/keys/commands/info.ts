import { T, FT } from "#lib/types";

export const Description = T<string>("commands/info:description");
export const DetailedDescription = T<string>("commands/info:detailedDescription");
export const EmbedTitle = FT<{ users: number, servers: number }, string>("commands/info:title");
export const EmbedDescription = T<string>("commands/info:description");