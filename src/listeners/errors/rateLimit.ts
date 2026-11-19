import { Listener } from "@sapphire/framework";
import type { RateLimitData } from "discord.js";

export class UserListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      emitter: "rest",
    });
  }

  public run(rateLimitData: RateLimitData) {
    const { logger } = this.container;

    logger.warn(
      `[RATE LIMIT ${rateLimitData.global ? "(GLOBAL)" : ""}] [PATH: ${rateLimitData.url} LIMIT: ${rateLimitData.limit}] RESET: ${rateLimitData.timeToReset}`,
    );
  }
}
