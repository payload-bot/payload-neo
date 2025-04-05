import { AliasStore } from "@sapphire/framework";
import { AutoCommand } from "./AutoResponse.ts";

export class AutoResponseStore extends AliasStore<AutoCommand, "auto"> {
  constructor() {
    super(AutoCommand, { name: "auto" });
  }
}
