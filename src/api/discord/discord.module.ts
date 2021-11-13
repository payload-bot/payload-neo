import { UsersModule } from "#api/users/users.module";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { DiscordService } from "./services/discord.service";

@Module({
  imports: [HttpModule, UsersModule],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
