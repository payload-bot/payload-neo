import { FT, T } from "#lib/types/index";

export const Description = T<string>("commands/language:description");
export const DetailedDescription = T<string>("commands/language:detailedDescription");
export const CurrentLanguage = FT<{ language: string }, string>("commands/language:currentLanguage");
export const SetNeedsArgs = T<string>("commands/language:setNeedsArgs");
export const SetSameLanguage = T<string>("commands/language:setSamelanguage");
export const SetLanguageEmbedTitle = FT<{ user: string }, string>("commands/language:setLanguageEmbedTitle");
export const SetLanguageEmbedDesc = FT<{ old: string; new: string }, string>("commands/language:setLanguageEmbedDesc");
export const DeleteAlreadyDefault = T<string>("commands/language:deleteAlreadyDefault");
