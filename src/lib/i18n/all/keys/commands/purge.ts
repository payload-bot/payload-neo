import { FT } from "#lib/types/index";

export const Deleted = FT<{ count: number, seconds: number }, string>("commands/purge:deleted");
