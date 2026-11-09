import { Command } from "@sapphire/framework";
import { Events, Listener } from "@sapphire/framework";
import { Interaction } from "discord.js";
import { commandCounter } from "#lib/metrics.ts";

export class ContextMenuCommandRunListener extends Listener<typeof Events.ContextMenuCommandRun> {
  public async run(_: Interaction, { name }: Command) {
    await commandCounter.inc({ command: name });
  }
}
