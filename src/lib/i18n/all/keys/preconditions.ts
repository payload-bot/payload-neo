import { FT, T } from "#lib/types";

export const ClientPermissions = FT<{ missing: string[] }>("preconditions:clientPermissions");
export const Cooldown = FT<{ remaining: number }>("preconditions:cooldown");
export const DisabledGlobal = T("preconditions:disabledGlobal");
export const Nsfw = T("preconditions:nsfw");
export const ThreadOnly = T("preconditions:threadOnly");
export const UserPermissions = FT<{ missing: string[] }>("preconditions:userPermissions");
