import { Environment } from "#api/environment/environment";
import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { red, blue } from "colorette";
import type { Cache } from "cache-manager";
import { CACHE_OPTIONS_KEY } from "./cache.constants";
import Redis from "ioredis";
import type { ICacheService } from "./cache.interface";
import type { CacheModuleOptions } from "./cache.module";

@Injectable()
export class CacheService implements ICacheService {
  private logger = new Logger(CacheService.name);
  private instance: Redis | Cache;

  constructor(
    private env: Environment,
    @Inject(CACHE_MANAGER) readonly memoryCache: Cache,
    @Inject(CACHE_OPTIONS_KEY) readonly options: CacheModuleOptions
  ) {
    const store = options.store;

    if (store === "redis") {
      this.logger.verbose(`Using ${red("REDIS")} for the cache storage`);
      this.instance = new Redis(this.env.redisUrl!);
    } else if (store === "memory") {
      this.logger.verbose(`Using ${blue("MEMORY")} for the cache storage`);
      this.instance = memoryCache;
    } else {
      this.instance = new Redis(this.env.redisUrl!);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    return ((await this.instance.get<T>(key)) as T) ?? null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (this.instance instanceof Redis) {
      if (typeof ttl === "number") {
        await this.instance.set(key, value as any, "EX", ttl);
        return;
      }
      await this.instance.set(key, value as any);
      return;
    } else {
      if (typeof ttl === "number") {
        await this.instance.set(key, value, ttl);
        return;
      }
      await this.instance.set(key, value);
      return;
    }
  }

  async del(key: string): Promise<void> {
    await this.instance.del(key);
  }
}
