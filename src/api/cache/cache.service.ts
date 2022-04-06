import { Environment } from "#api/environment/environment";
import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { red, blue } from "colorette";
import type { Cache } from "cache-manager";
import Redis from "ioredis";
import type { ICacheService } from "./cache.interface";
import { envParseBoolean } from "#utils/envParser";

@Injectable()
export class CacheService implements ICacheService {
  private logger = new Logger(CacheService.name);
  private instance: Redis | Cache;

  constructor(
    private env: Environment,
    @Inject(CACHE_MANAGER) readonly memoryCache: Cache
  ) {
    const shouldUseRedis =
      ["production", "staging"].includes(this.env.nodeEnv) ||
      envParseBoolean("OVERRIDE_SESSION_STORAGE", false);

    if (shouldUseRedis) {
      this.logger.verbose(`Using ${red("REDIS")} for the cache storage`);
      this.instance = new Redis(this.env.redisUrl!);
    } else {
      this.logger.verbose(`Using ${blue("MEMORY")} for the cache storage`);
      this.instance = memoryCache;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    return ((await this.instance.get<T>(key)) as T) ?? null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (this.instance instanceof Redis) {
      if (typeof ttl === "number") {
        await this.instance.set(key, JSON.stringify(value), "EX", ttl);
      } else {
        await this.instance.set(key, JSON.stringify(value));
      }
    } else {
      if (typeof ttl === "number") {
        await this.instance.set(key, value, ttl);
        return;
      } else {
        await this.instance.set(key, value);
      }
    }
  }

  async del(key: string): Promise<void> {
    await this.instance.del(key);
  }
}
