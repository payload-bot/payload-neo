import { Events, Listener } from "@sapphire/framework";

export class UserListener extends Listener<typeof Events.ContextMenuCommandRun> {
  public async run() {
    // Emit metric
  }
}
