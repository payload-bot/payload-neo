import { FT, T } from "#lib/types";

export const Description = T<string>("commands/restrict:description");
export const DetailedDescription = T<string>("commands/restrict:detailedDescription");
export const NoCommands = T<string>("commands/restrict:noCommands");
export const ListRestrictions = T<string>("commands/restrict:listRestrictions");
export const ListRestrictionsEmpty = T<string>("commands/restrict:listRestrictionsEmpty");
export const RestrictSuccess = FT<{ commands: string }, string>("commands/restrict:restrictSuccess");
