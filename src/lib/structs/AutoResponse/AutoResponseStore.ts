import { AliasStore } from "@sapphire/framework";
import { AutoCommand } from "./AutoResponse.js";

export class AutoResponseStore extends AliasStore<AutoCommand> {
  constructor() {
    super(AutoCommand as any, { name: "autoresponses" });
  }
}
