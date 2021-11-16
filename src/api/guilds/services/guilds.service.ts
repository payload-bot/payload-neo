import { DiscordService } from "#api/discord/services/discord.service";
import { UserService } from "#api/users/services/user.service";
import { Webhook } from "#api/webhooks/models/webhook.model";
import config from "#root/config";
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { container } from "@sapphire/framework";
import { plainToClass } from "class-transformer";
import type { Model, UpdateQuery } from "mongoose";
import { GuildResponseDto } from "../dto/guild-response.dto";
import { Server, GuildDocument } from "../models/guild.model";

const { client } = container;

@Injectable()
export class GuildsService {
  private logger = new Logger(GuildsService.name);

  constructor(
    @InjectModel(Server.name)
    private guildModel: Model<GuildDocument>,
    private usersService: UserService,
    private discordService: DiscordService
  ) {}

  async getUserGuilds(id: string) {
    this.logger.debug("Fetching user guilds...");
    const startTime = Date.now();

    const { accessToken, refreshToken } =
      await this.usersService.getDiscordTokensForUser(id);

    // User must authenticate again
    if (!accessToken || !refreshToken) throw new UnauthorizedException();

    const userServers = await this.discordService.getSortedUserGuilds(
      id,
      accessToken!,
      refreshToken!
    );

    this.logger.debug("Done fetching user guilds!");
    this.logger.debug(`It took ${Date.now() - startTime}ms `);

    return userServers;
  }

  async getUserGuild(guildId: string) {
    const {
      enableSnipeForEveryone = false,
      language = "en-US",
      prefix = config.PREFIX,
      fun,
    } = await this.findOrCreateGuild(guildId);

    const clientGuild = await client.guilds.fetch(guildId);
    const botMemberInGuild = await clientGuild.members.fetch(client.user!.id);

    return new GuildResponseDto({
      id: guildId,
      prefix,
      language,
      enableSnipeForEveryone,
      pushcartPoints: fun?.payloadFeetPushed ?? 0,
      botName: botMemberInGuild.nickname ?? botMemberInGuild.user.username,
      icon: clientGuild.iconURL(),
    });
  }

  async getGuildWebhook(guildId: string) {
    const guild = await this.guildModel
      .findOne({ id: guildId })
      .orFail()
      .lean()
      .populate("webhook")
      .exec();

    if (!guild?.webhook) {
      throw new NotFoundException();
    }

    return plainToClass(Webhook, guild.webhook);
  }

  async findOrCreateGuild(guildId: string) {
    let guild: Server;
    try {
      guild = await this.guildModel
        .findOne({ id: guildId })
        .orFail()
        .lean()
        .exec();
    } catch (err) {
      guild = await this.guildModel.create({ id: guildId });
    }

    return plainToClass(Server, guild);
  }

  async getGuildById(guildId: string) {
    const guild = await this.guildModel
      .findOne({ id: guildId })
      .orFail()
      .lean()
      .exec();

    return plainToClass(Server, guild);
  }

  async updateGuildById(guildId: string, details: UpdateQuery<Server>) {
    const guild = await this.guildModel
      .findOneAndUpdate({ id: guildId }, details, { new: true })
      .orFail()
      .lean()
      .exec();

    return plainToClass(Server, guild);
  }
}
