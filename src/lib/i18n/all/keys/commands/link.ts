import { FT, T } from "#lib/types";

export const Name = T<string>("commands/link:name");
export const SteamIdName = T<string>("commands/link:steamIdName");
export const Description = T<string>("commands/link:description");
export const SteamIdDescription = T<string>("commands/link:steamIdDescription");
export const DetailedDescription = T<string>("commands/link:detailedDescription");
export const MissingId = T<string>("commands/link:missingId");
export const MalformedId = T<string>("commands/link:malformedId");
export const Success = FT<{ steamId: string }>("commands/link:success");
export const Delete = T<string>("commands/link:delete");
