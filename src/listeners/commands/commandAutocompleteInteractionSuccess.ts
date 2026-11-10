import { Events, Listener } from "@sapphire/framework";
import { autoCompletes } from "#lib/metrics.ts";
import { Interaction } from "discord.js";
import { Command } from "@sapphire/framework";

export class CommandAutoCompleteInteractionRun extends Listener<typeof Events.CommandAutocompleteInteractionSuccess> {
  public run(_: Interaction, { name }: Command) {
    autoCompletes.inc({ command: name, auto: "false" });
  }
}
