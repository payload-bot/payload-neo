import { DiscordService } from "#api/discord/services/discord.service";
import { UserService } from "#api/users/services/user.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { plainToClass } from "class-transformer";
import type { Model } from "mongoose";
import { Guild, GuildDocument } from "../models/guild.model";

@Injectable()
export class GuildsService {
  constructor(
    @InjectModel(Guild.name)
    private guildModel: Model<GuildDocument>,
    private usersService: UserService,
    private discordService: DiscordService
  ) {}

  async getUserGuilds(id: string) {
    const { accessToken, refreshToken } =
      await this.usersService.getDiscordTokensForUser(id);

    // User must authenticate again
    if (!accessToken || !refreshToken) throw new UnauthorizedException();

    const userServers = await this.discordService.getSortedUserGuilds(
      id,
      accessToken!,
      refreshToken!
    );

    return userServers;
  }

  async getUserGuild(id: string, guildId: string) {
    return { id, guildId };
  }

  async getGuildById(guildId: string) {
    const guild = await this.guildModel
      .findOne({ id: guildId })
      .orFail()
      .lean()
      .exec();

    return plainToClass(Guild, guild);
  }

  async getGuildByIdNullable(guildId: string) {
    const guild = await this.guildModel.findOne({ id: guildId }).lean().exec();

    return plainToClass(Guild, guild);
  }
}
