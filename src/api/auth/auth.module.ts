import { DiscordModule } from "#api/discord/discord.module";
import { UsersModule } from "#api/users/users.module";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "./controllers/auth.controller";
import { RefreshToken, RefreshTokenSchema } from "./models/refreshToken.model";
import { AuthService } from "./services/auth.service";
import { DiscordStrategy } from "./strategies/discord.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    UsersModule,
    DiscordModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, DiscordStrategy],
  exports: [AuthService],
})
export class AuthModule {}
