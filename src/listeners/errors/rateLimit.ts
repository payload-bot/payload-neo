import { Events, Listener } from "@sapphire/framework";
import type { RateLimitData } from "discord.js";

export class UserListener extends Listener<typeof Events.RateLimit> {
  public run(rateLimitData: RateLimitData) {
    const { logger } = this.container;

    logger.warn(
      `[RATE LIMIT${rateLimitData.global ? "(GLOBAL)" : ""}] [PATH: ${
        rateLimitData.method
      } ${rateLimitData.path}] LIMIT: ${rateLimitData.limit}] TIMEOUT: ${
        rateLimitData.timeout
      }`
    );
  }
}
