import { Listener } from "@sapphire/framework";
import { DiscordAPIError, HTTPError } from "discord.js";

const NEWLINE = "\n";

export class UserListener extends Listener {
  public run(error: Error) {
    const { logger } = this.container;

    if (error instanceof DiscordAPIError) {
      logger.warn(
        `[API ERROR] [CODE: ${error.code}] ${
          error.message
        }${NEWLINE}${" ".repeat(12)}[PATH: ${error.method} ${error.path}]`
      );
      logger.fatal(error.stack);
    } else if (error instanceof HTTPError) {
      logger.warn(
        `[HTTP ERROR] [CODE: ${error.code}] ${
          error.message
        }${NEWLINE}${" ".repeat(12)}[PATH: ${error.method} ${error.path}]`
      );
      logger.fatal(error);
    } else {
      logger.error(error);
    }
  }
}
