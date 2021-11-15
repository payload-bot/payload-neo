import { Module } from "@nestjs/common";
import { GuildsService } from "./services/guilds.service";
import { GuildsController } from "./controllers/guilds.controller";
import { UsersModule } from "#api/users/users.module";
import { DiscordModule } from "#api/discord/discord.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Server, GuildSchema } from "./models/guild.model";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Server.name, schema: GuildSchema }]),
    DiscordModule,
    UsersModule,
  ],
  controllers: [GuildsController],
  providers: [GuildsService],
  exports: [GuildsService],
})
export class GuildsModule {}
