import { Events, Listener } from "@sapphire/framework";
import { free } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";

export class UserListener extends Listener<typeof Events.MessageDelete> {
  public async run(message: Message) {
    free(message);
  }
}
