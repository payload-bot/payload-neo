import { Events, Listener } from "@sapphire/framework";
import { commandCounter } from "#lib/metrics.ts";
import { Interaction } from "discord.js";
import { Command } from "@sapphire/framework";

export class ChatInputRunCommandListener extends Listener<typeof Events.ChatInputCommandRun> {
  public async run(_: Interaction, { name }: Command) {
    await commandCounter.inc({ command: name, auto: false });
  }
}
