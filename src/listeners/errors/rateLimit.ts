import { ApplyOptions } from "@sapphire/decorators";
import { Listener, type ListenerOptions } from "@sapphire/framework";
import type { RateLimitData } from "discord.js";

@ApplyOptions<ListenerOptions>({
  emitter: "rest",
})
export class UserListener extends Listener {
  public run(rateLimitData: RateLimitData) {
    const { logger } = this.container;

    logger.warn(
      `[RATE LIMIT ${rateLimitData.global ? "(GLOBAL)" : ""}] [PATH: ${rateLimitData.url} LIMIT: ${rateLimitData.limit}] RESET: ${rateLimitData.timeToReset}`,
    );
  }
}
