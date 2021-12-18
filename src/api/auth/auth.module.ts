import { DiscordModule } from "#api/discord/discord.module";
import { UsersModule } from "#api/users/users.module";
import { Module } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { DiscordStrategy } from "./strategies/discord.strategy";

@Module({
  imports: [UsersModule, DiscordModule],
  controllers: [AuthController],
  providers: [AuthService, DiscordStrategy],
  exports: [AuthService],
})
export class AuthModule {}
