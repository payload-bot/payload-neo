import { DiscordModule } from "#api/discord/discord.module";
import { UsersModule } from "#api/users/users.module";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { SessionSerializer } from "./services/session.serializer";
import { DiscordStrategy } from "./strategies/discord.strategy";

@Module({
  imports: [UsersModule, DiscordModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, DiscordStrategy, SessionSerializer],
  exports: [AuthService],
})
export class AuthModule {}
