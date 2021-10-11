import { Precondition } from "@sapphire/framework";

declare module "@sapphire/framework" {
  interface Preconditions {
    OwnerOnly: never;
  }
}

declare module "@sapphire/pieces" {
  interface Container {}
}
