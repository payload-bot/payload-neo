import { Events, Listener } from "@sapphire/framework";
import { commandCounter } from "#lib/metrics.ts";
import type { Interaction } from "discord.js";
import type { Command } from "@sapphire/framework";

export class ChatInputRunCommandListener extends Listener<typeof Events.ChatInputCommandRun> {
  public run(_: Interaction, { name }: Command) {
    commandCounter.inc({ command: name, auto: "false" });
  }
}
