import { Precondition } from "@sapphire/framework";
import type { CustomFunctionGet, CustomGet } from "#lib/types";
import type { SnipeCache } from "#lib/interfaces/cache";
import type { PayloadCommand } from "#lib/structs/commands/PayloadCommand";
import type { BooleanString, IntegerString, NumberString, ArrayString } from "@skyra/env-utilities";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export type O = object;

declare module "discord.js" {
  interface Client {
    readonly dev: boolean;
    readonly cache: SnipeCache;
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    OwnerOnly: never;
  }

  interface ArgType {
    commandName: PayloadCommand;
  }

  interface StoreRegistryEntries {
    auto;
  }

  export interface Args {
    t: TFunction;
  }
}

declare module "@sapphire/pieces" {
  interface Container {
    database: BetterSQLite3Database;
  }
}

declare module "i18next" {
  export interface TFunction {
    ns?: string;

    <K extends string, TReturn>(key: CustomGet<K, TReturn>, options?: TOptionsBase | string): TReturn;

    <K extends string, TReturn>(
      key: CustomGet<K, TReturn>,
      defaultValue: TReturn,
      options?: TOptionsBase | string,
    ): TReturn;

    <K extends string, TArgs extends O, TReturn>(
      key: CustomFunctionGet<K, TArgs, TReturn>,
      options?: TOptions<TArgs>,
    ): TReturn;

    <K extends string, TArgs extends O, TReturn>(
      key: CustomFunctionGet<K, TArgs, TReturn>,
      defaultValue: TReturn,
      options?: TOptions<TArgs>,
    ): TReturn;
  }
}

declare module "@skyra/env-utilities" {
  interface Env {
    /**
     * The list of bot owners
     * @deprecated Fetch from application owners instead
     */
    OWNERS: ArrayString;

    /**
     * The URL to a Chrome websocket connection
     * @remarks This is only used in PRODUCTION
     */
    CHROME_WS_URL: string;

    /**
     * The port to run the HTTP server
     */
    PORT: IntegerString;

    /**
     * Flag to override the chrome ws
     */
    CHROME_WS_ENABLE: BooleanString;

    /**
     * The path of the database to use
     */
    DATABASE_PATH: string;
  }
}
