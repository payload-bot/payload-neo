import { FT, T } from "#lib/types";

export const NoOptions = T<string>("commands/choose:noOptions");
export const Chosen = FT<{ options: string }, string>("commands/choose:chosen");
