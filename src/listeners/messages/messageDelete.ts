import type { PayloadClient } from "#lib/PayloadClient";
import { handleMessageDelete } from "#utils/snipeCache";
import { Events, Listener } from "@sapphire/framework";
import type { Message } from "discord.js";

export class UserListener extends Listener<typeof Events.MessageDelete> {
  public async run(oldMsg: Message) {
    const { client } = this.container;

    handleMessageDelete(client as PayloadClient, oldMsg);
  }
}
