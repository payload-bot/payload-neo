import { Precondition } from "@sapphire/framework";
import type { CustomFunctionGet, CustomGet } from "#lib/types";

export type O = object;

declare module "@sapphire/framework" {
  interface Preconditions {
    OwnerOnly: never;
  }
}

declare module "@sapphire/pieces" {
  interface Container {}
}

declare module "i18next" {
  export interface TFunction {
    ns?: string;

    <K extends string, TReturn>(
      key: CustomGet<K, TReturn>,
      options?: TOptionsBase | string
    ): TReturn;

    <K extends string, TReturn>(
      key: CustomGet<K, TReturn>,
      defaultValue: TReturn,
      options?: TOptionsBase | string
    ): TReturn;

    <K extends string, TArgs extends O, TReturn>(
      key: CustomFunctionGet<K, TArgs, TReturn>,
      options?: TOptions<TArgs>
    ): TReturn;

    <K extends string, TArgs extends O, TReturn>(
      key: CustomFunctionGet<K, TArgs, TReturn>,
      defaultValue: TReturn,
      options?: TOptions<TArgs>
    ): TReturn;
  }
}
