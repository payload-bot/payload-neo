import { Events, Listener } from "@sapphire/framework";
import { autoCompletes } from "#lib/metrics.ts";
import type { Interaction } from "discord.js";
import type { Command } from "@sapphire/framework";

export class CommandAutoCompleteInteractionRun extends Listener<typeof Events.CommandAutocompleteInteractionSuccess> {
  public run(_: Interaction, { name }: Command) {
    autoCompletes.inc({ command: name, auto: "false" });
  }
}
