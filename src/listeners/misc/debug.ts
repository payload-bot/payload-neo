import { Events, Listener } from "@sapphire/framework";

export class UserListener extends Listener<typeof Events.Debug> {
  public run(message: string) {
    if (!this.container.client.dev) {
      return;
    }

    const { logger } = this.container;

    logger.debug(message);
  }
}
