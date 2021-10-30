import { FT, T } from "#lib/types";

export const Description = T<string>("commands/choose:description");
export const DetailedDescription = T<string>("commands/choose:detailedDescription");
export const NoOptions = T<string>("commands/choose:noOptions");
export const Chosen = FT<{ options: string }, string>("commands/choose:chosen");
