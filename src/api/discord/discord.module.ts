import { HttpModule } from "@nestjs/axios";
import { CacheModule, Module } from "@nestjs/common";
import { DiscordService } from "./services/discord.service";

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
