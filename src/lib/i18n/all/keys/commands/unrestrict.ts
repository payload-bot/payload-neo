import { FT, T } from "#lib/types";

export const Description = T<string>("commands/unrestrict:description");
export const DetailedDescription = T<string>("commands/unrestrict:detailedDescription");
export const NoCommands = T<string>("commands/restrict:noCommands");
export const UnrestrictSuccess = FT<{ commands: string }, string>("commands/unrestrict:unrestrictSuccess");
