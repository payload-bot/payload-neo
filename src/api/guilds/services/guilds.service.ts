import { DiscordService } from "#api/discord/services/discord.service";
import { Benchmark } from "#api/shared/perf-hook.decorator";
import { UserService } from "#api/users/services/user.service";
import { Webhook } from "#api/webhooks/models/webhook.model";
import type { AutoResponseStore } from "#lib/structs/AutoResponse/AutoResponseStore";
import config from "#root/config";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { container } from "@sapphire/framework";
import { plainToClass } from "class-transformer";
import type { Model, UpdateQuery } from "mongoose";
import { GuildResponseDto } from "../dto/guild-response.dto";
import type { UpdateGuildDto } from "../dto/update-guild.dto";
import { Server, GuildDocument } from "../models/guild.model";

const { client, stores } = container;

@Injectable()
export class GuildsService {
  constructor(
    @InjectModel(Server.name)
    private guildModel: Model<GuildDocument>,
    private usersService: UserService,
    private discordService: DiscordService
  ) {}

  @Benchmark
  async getUserGuilds(id: string) {
    const { accessToken, refreshToken } =
      await this.usersService.getDiscordTokensForUser(id);

    // TODO: This should be handled in the controller
    // User must authenticate again
    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException();
    }

    // FIXME: ensure this can never throw unless Discord is down
    const userServers = await this.discordService.getSortedUserGuilds(
      id,
      accessToken!,
      refreshToken!
    );

    return userServers;
  }

  async getUserGuildsManagable(userId: string, guildId: string) {
    const guild = await client.guilds.fetch(guildId).catch(() => null);

    if (!guild) {
      throw new BadRequestException();
    }

    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) {
      throw new BadRequestException();
    }

    return await this.discordService.canUserManageGuild(guild, member);
  }

  async getUserGuild(guildId: string) {
    const {
      enableSnipeForEveryone = false,
      language = "en-US",
      prefix = config.PREFIX,
      webhook,
      commandRestrictions,
      fun,
    } = await this.findOrCreateGuild(guildId);

    const commands = stores.get("commands");
    const autoCommands = stores.get(
      "autoresponses"
    ) as unknown as AutoResponseStore;

    const clientGuild = await client.guilds.fetch(guildId);
    const botMemberInGuild = await clientGuild.members.fetch(client.user!.id);

    return new GuildResponseDto({
      id: guildId,
      prefix,
      language,
      enableSnipeForEveryone,
      webhook: webhook as unknown as Webhook,
      name: clientGuild.name,
      pushcartPoints: fun?.payloadFeetPushed ?? 0,
      botName: botMemberInGuild.nickname ?? botMemberInGuild.user.username,
      icon: clientGuild.iconURL(),
      channels: clientGuild.channels.cache
        .filter((c) => c.type === "GUILD_TEXT")
        .map(({ id, name }) => ({ id, name })),
      commands: {
        restrictions: commandRestrictions ?? [],
        commands: commands.filter((c) => c.enabled).map((c) => c.name),
        autoResponses: autoCommands.filter((c) => c.enabled).map((c) => c.name),
      },
    });
  }

  async getGuildWebhook(guildId: string) {
    const guild = await this.findOrCreateGuild(guildId);

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
        .populate("webhook")
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

  async updateGuildWithClientData(guildId: string, details: UpdateGuildDto) {
    const { botName, ...toUpdate } = details;

    if (botName) {
      const guild = await client.guilds.fetch(guildId);

      await guild.me?.setNickname(botName);
    }

    return await this.updateGuildById(guildId, toUpdate);
  }

  async updateGuildById(guildId: string, details: UpdateQuery<GuildDocument>) {
    const guild = await this.guildModel
      .findOneAndUpdate({ id: guildId }, details, { new: true })
      .orFail()
      .lean()
      .exec();

    return plainToClass(Server, guild);
  }
}
