import { GuildsModule } from "#api/guilds/guilds.module";
import { UsersModule } from "#api/users/users.module";
import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";
import { DiscordService } from "./services/discord.service";

@Module({
  imports: [HttpModule, UsersModule, forwardRef(() => GuildsModule)],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
