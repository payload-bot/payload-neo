import { FT, T } from "#lib/types";

export const NoHistory = T<string>("commands/log:noHistory");
export const NoIdLinked = FT<{ user: string }, string>("commands/log:noIdLinked");
export const Button = FT<{ user: string }, string>("commands/log:button");