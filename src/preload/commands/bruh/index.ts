import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";

export default class Bruh extends Command {
  constructor() {
    super("bruh", "Bruh.", [
      {
        name: "user mention",
        description: "The user to bruh.",
        required: false,
        type: "string",
      },
    ]);
  }

  async run(client: Client, msg: Message): Promise<boolean> {
    if (msg.mentions.users.size > 0) {
      const mention = msg.mentions.users.first();
      await this.respond(msg, `bruh ${mention.toString()}`);
    } else await this.respond(msg, `bruh`);

    return true;
  }
}
