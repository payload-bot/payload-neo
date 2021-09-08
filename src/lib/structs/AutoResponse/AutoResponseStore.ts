import { AliasStore } from "@sapphire/framework";
import { AutoCommand } from "./AutoResponse";

export class AutoResponseStore extends AliasStore<AutoCommand> {
  constructor() {
    super(AutoCommand as any, { name: "autoresponses" });
  }
}
