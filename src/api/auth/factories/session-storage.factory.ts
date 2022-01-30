import { MemoryStore } from "express-session";
import session from "express-session";
import { red, blue } from "colorette";
import { Time } from "@sapphire/time-utilities";
import { Logger } from "@nestjs/common";

export class SessionStorageFactory {
  private logger = new Logger();

  constructor(private env: string) {}

  public async register() {
    if (this.env === "development") {
      this.logger.verbose(`Using ${red("REDIS")} as session store`);
      const { default: Redis } = await import("ioredis");

      const client = new Redis({});

      const RedisStore = (await import("connect-redis")).default(session);

      return new RedisStore({ client, ttl: Time.Month, prefix: "session::" });
    }

    this.logger.verbose(`Using ${blue("MEMORY")} as session store`);
    return new MemoryStore();
  }
}
