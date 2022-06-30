import { T, FT } from "#lib/types/index";

export const Description = T<string>("commands/purge:description");
export const DetailedDescription = T<string>("commands/purge:detailedDescription");
export const Deleted = FT<{ count: number; seconds: number }, string>("commands/purge:deleted");
