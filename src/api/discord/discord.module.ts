import { CacheModule } from "#api/cache/cache.module";
import { UsersModule } from "#api/users/users.module";
import { Module } from "@nestjs/common";
import { DiscordService } from "./services/discord.service";

@Module({
  imports: [CacheModule.register(), UsersModule],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
