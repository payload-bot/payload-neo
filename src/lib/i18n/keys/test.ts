import { FT, T } from "#lib/types";

export const Test = T("test:string");
export const TestArgs = FT<{ args: string }>("test:string");
