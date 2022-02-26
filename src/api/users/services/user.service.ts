import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { plainToClass } from "class-transformer";
import type { FilterQuery, Model, UpdateQuery } from "mongoose";
import { Profile } from "../dto/profile.dto";
import { container } from "@sapphire/framework";
import { User, UserDocument } from "../models/user.model";
import { Environment } from "#api/environment/environment";
import type { UpdateProfileDto } from "../dto/update-profile.dto";
import { DiscordService } from "#api/discord/services/discord.service";

export interface CreateUserParams {
  id: string;
  accessToken: string;
  refreshToken: string;
}

const { client } = container;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private discordService: DiscordService,
    private environment: Environment
  ) {}

  async userToProfile(id: string) {
    const { notificationsLevel, steamId, fun } = await this.findUser({ id });

    const user = await client.users.fetch(id);

    const roles = [];

    if (this.environment.owners.includes(id)) roles.push("admin");
    if (await this.isBetaTester(id)) roles.push("betatester");

    return new Profile({
      id,
      steamId,
      roles,
      username: user.tag,
      notificationsLevel: notificationsLevel,
      avatar: user.displayAvatarURL(),
      pushcartPoints: parseInt(fun?.payload?.feetPushed ?? 0, 10),
    });
  }

  async getDiscordTokensForUser(id: string) {
    const { accessToken, refreshToken } = await this.userModel
      .findOne({ id })
      .orFail()
      .lean()
      .exec();

    return { accessToken, refreshToken };
  }

  async revokeTokens(id: string, authToken: string) {
    await Promise.all([
      this.discordService.revokeUserTokens(authToken),
      this.updateUser(id, { $unset: { accessToken: 1, refreshToken: 1 } }),
    ]);

    return;
  }

  async findUser(query: FilterQuery<UserDocument>): Promise<User> {
    return plainToClass(
      User,
      await this.userModel.findOne(query).orFail().lean().exec()
    );
  }

  async updateUser(
    id: string,
    query: UpdateQuery<UserDocument>
  ): Promise<User> {
    const updatedUser = await this.userModel
      .findOneAndUpdate({ id }, query, {
        new: true,
      })
      .lean()
      .exec();

    return plainToClass(User, updatedUser);
  }

  async updateUserProfile(id: string, details: UpdateProfileDto) {
    return await this.updateUser(id, { ...details });
  }

  async createUser({
    id,
    accessToken,
    refreshToken,
  }: CreateUserParams): Promise<User> {
    const user = await this.userModel.create({
      id,
      accessToken,
      refreshToken,
    });

    return plainToClass(User, user);
  }

  private async isBetaTester(discordId: string) {
    try {
      const discord = await client.guilds.fetch(this.environment.discordId);
      const member = await discord.members.fetch(discordId);

      if (!member) return false;

      const userHasBetaRole = member.roles.cache.get(
        this.environment.discordBetaRoleId
      );

      return userHasBetaRole ? true : false;
    } catch (_ex) {
      return false;
    }
  }
}
