import { CacheModule } from "#api/cache/cache.module";
import { UsersModule } from "#api/users/users.module";
import { forwardRef, Module } from "@nestjs/common";
import { DiscordService } from "./services/discord.service";

@Module({
  imports: [CacheModule.register(), forwardRef(() => UsersModule)],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
