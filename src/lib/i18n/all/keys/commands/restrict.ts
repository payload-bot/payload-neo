import { FT, T } from "#lib/types";

export const NoCommands = T<string>("commands/restrict:noCommands");
export const RestrictSuccess = FT<{ commands: string }, string>("commands/restrict:restrictSuccess");
