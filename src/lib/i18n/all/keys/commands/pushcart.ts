import { FT, T } from "#lib/types";

export const Name = T<string>("commands/pushcart:name");
export const Description = T<string>("commands/pushcart:description");
export const DetailedDescription = T<string>("commands/pushcart:detailedDescription");

export const Cooldown = FT<{ seconds: string }, string>("commands/pushcart:cooldown");
export const Maxpoints = FT<{ expires: string }, string>("commands/pushcart:maxpoints");
export const PushSuccess = FT<{ units: string; total: string }, string>("commands/pushcart:pushSuccess");
