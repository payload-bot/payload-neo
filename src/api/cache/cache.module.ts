import {
  CacheModule as NestCacheModule,
  DynamicModule,
  Module,
} from "@nestjs/common";
import { CacheService } from "./cache.service";

@Module({})
export class CacheModule {
  static register(): DynamicModule {
    return {
      module: CacheModule,
      imports: [NestCacheModule.register()],
      providers: [CacheService],
      exports: [CacheService],
    };
  }
}

export type CacheModuleOptions = {
  store: "redis" | "memory";
};
