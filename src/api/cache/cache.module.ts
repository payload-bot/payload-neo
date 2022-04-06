import {
  CacheModule as NestCacheModule,
  DynamicModule,
  Module,
} from "@nestjs/common";
import { CACHE_OPTIONS_KEY } from "./cache.constants";
import { CacheService } from "./cache.service";


@Module({})
export class CacheModule {
  static register(options: CacheModuleOptions): DynamicModule {
    return {
      module: CacheModule,
      imports: [NestCacheModule.register()],
      providers: [
        CacheService,
        {
          provide: CACHE_OPTIONS_KEY,
          useValue: options,
        },
      ],
      exports: [CacheService],
    };
  }
}

export type CacheModuleOptions = {
  store: "redis" | "memory";
};
