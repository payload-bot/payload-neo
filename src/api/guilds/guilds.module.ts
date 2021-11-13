import { forwardRef, Module } from "@nestjs/common";
import { GuildsService } from "./services/guilds.service";
import { GuildsController } from "./controllers/guilds.controller";
import { UsersModule } from "#api/users/users.module";
import { DiscordModule } from "#api/discord/discord.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Guild, GuildSchema } from "./models/guild.model";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Guild.name, schema: GuildSchema }]),
    forwardRef(() => DiscordModule),
    UsersModule,
  ],
  controllers: [GuildsController],
  providers: [GuildsService],
  exports: [GuildsService],
})
export class GuildsModule {}
