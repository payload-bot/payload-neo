import { FT, T } from "#lib/types";

export const Name = T<string>("commands/info:name");
export const Description = T<string>("commands/info:description");
export const DetailedDescription = T<string>("commands/info:detailedDescription");
export const EmbedTitle = FT<{ users: number; servers: number }, string>("commands/info:embedTitle");
export const EmbedDescription = T<string>("commands/info:embedDescription");
