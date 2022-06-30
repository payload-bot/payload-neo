import { FT, T } from "#lib/types/index";

export const Description = T<string>("commands/prefix:description");
export const DetailedDescription = T<string>("commands/prefix:detailedDescription");
export const CurrentPrefix = FT<{ prefix: string }, string>("commands/prefix:currentPrefix");
export const SetNeedsArgs = T<string>("commands/prefix:setNeedsArgs");
export const SetSamePrefix = T<string>("commands/prefix:setSamePrefix");
export const SetPrefixEmbedTitle = FT<{ user: string }, string>("commands/prefix:setPrefixEmbedTitle");
export const SetPrefixEmbedDesc = FT<{ old: string; new: string }, string>("commands/prefix:setPrefixEmbedDesc");
export const DeleteAlreadyDefault = T<string>("commands/prefix:deleteAlreadyDefault");
