import { MemoryStore } from "express-session";
import session from "express-session";
import { red, blue } from "colorette";
import { Time } from "@sapphire/time-utilities";
import { Logger } from "@nestjs/common";
import type { Environment } from "#api/environment/environment";
import { envParseBoolean } from "#utils/envParser";

export class SessionStorageFactory {
  private logger = new Logger();

  constructor(private env: Environment) {}

  public async register() {
    if (
      ["production", "staging"].includes(this.env.nodeEnv) ||
      envParseBoolean("OVERRIDE_SESSION_STORAGE", false)
    ) {
      this.logger.verbose(`Using ${red("REDIS")} as session store`);
      const { default: Redis } = await import("ioredis");

      const client = new Redis(this.env.redisUrl);

      const RedisStore = (await import("connect-redis")).default(session);

      return new RedisStore({ client, ttl: Time.Month, prefix: "session::" });
    }

    this.logger.verbose(`Using ${blue("MEMORY")} as session store`);
    return new MemoryStore();
  }
}
