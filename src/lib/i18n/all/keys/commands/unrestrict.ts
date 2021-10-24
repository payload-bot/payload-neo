import { FT, T } from "#lib/types";

export const NoCommands = T<string>("commands/restrict:noCommands");
export const UnrestrictSuccess = FT<{ commands: string }, string>("commands/unrestrict:unrestrictSuccess");
