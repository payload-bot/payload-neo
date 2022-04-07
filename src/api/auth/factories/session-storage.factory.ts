import { MemoryStore } from "express-session";
import session from "express-session";
import { red, blue } from "colorette";
import { Time } from "@sapphire/time-utilities";
import { Logger } from "@nestjs/common";
import { envParseBoolean } from "#utils/envParser";
// @ts-ignore I'm not totally convinced on this being an error
import { Environment } from "#api/environment/environment";

export class SessionStorageFactory {
  private logger = new Logger();

  constructor(private env: Environment) {}

  public async register() {
    if (
      ["production", "staging"].includes(this.env.nodeEnv) ||
      envParseBoolean("OVERRIDE_SESSION_STORAGE", false)
    ) {
      this.logger.verbose(`Using ${red("REDIS")} as the session store`);
      const { default: Redis } = await import("ioredis");

      const client = new Redis(this.env.redisUrl!, {
        connectTimeout: 5000,
        maxLoadingRetryTime: 10,
      });

      const RedisStore = (await import("connect-redis")).default(session);

      return new RedisStore({ client, ttl: Time.Month, prefix: "session::" });
    }

    this.logger.verbose(`Using ${blue("MEMORY")} as the session store`);
    return new MemoryStore();
  }
}
