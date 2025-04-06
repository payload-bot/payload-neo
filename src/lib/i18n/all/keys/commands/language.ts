import { FT, T } from "#lib/types";

export const Name = T<string>("commands/language:name");
export const Description = T<string>("commands/language:description");
export const DetailedDescription = T<string>("commands/language:detailedDescription");

export const SelectLanguage = T<string>("commands/language:selectLanguage");
export const SetLanguage = FT<string, { language: string }>("commands/language:setLanguage");
export const CurrentLanguage = FT<string, { language: string }>("commands/language:currentLanguage");

export const English = T<string>("commands/language:english");
export const Spanish = T<string>("commands/language:spanish");
export const German = T<string>("commands/language:german");
export const Finnish = T<string>("commands/language:finnish");
export const French = T<string>("commands/language:french");
export const Polish = T<string>("commands/language:polish");
export const Russian = T<string>("commands/language:russian");
