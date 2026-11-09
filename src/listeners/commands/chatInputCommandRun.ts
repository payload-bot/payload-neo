import { Events, Listener } from "@sapphire/framework";

export class UserListener extends Listener<typeof Events.ChatInputCommandRun> {
  public async run() {
    // Emit metric
  }
}
