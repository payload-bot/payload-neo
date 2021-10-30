import { T, FT } from "#lib/types";

export const Description = T<string>("commands/invite:description");
export const DetailedDescription = T<string>("commands/invite:detailedDescription");
export const Button = FT<{ url: string }, string>("commands/invite:button");