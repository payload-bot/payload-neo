import { Listener } from "@sapphire/framework";
import { DiscordAPIError, HTTPError } from "discord.js";

const NEWLINE = "\n";

export class UserListener extends Listener {
  public run(error: Error) {
    const { logger } = this.container;

    if (error instanceof DiscordAPIError) {
      logger.warn(
        `[API ERROR] [CODE: ${error.code}] ${error.message}${NEWLINE}${" ".repeat(12)}[PATH: ${error.method} ${
          error.url
        }]`
      );
      logger.fatal(error.stack ? error.stack : error.cause ? error.cause : error);
    } else if (error instanceof HTTPError) {
      logger.warn(
        `[HTTP ERROR] [CODE: ${error.status}] ${error.message}${NEWLINE}${" ".repeat(12)}[PATH: ${error.method} ${
          error.url
        }]`
      );
      logger.fatal(error);
    } else {
      logger.error(error);
    }
  }
}
