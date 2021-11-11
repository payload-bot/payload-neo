import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { plainToClass } from "class-transformer";
import type { FilterQuery, Model, UpdateQuery } from "mongoose";
import { Profile } from "../dto/profile.dto";
import { container } from "@sapphire/framework";
import { User, UserDocument } from "../models/user.model";
import { Environment } from "#api/environment/environment";
import { UpdateProfileDto } from "../dto/update-profile.dto";

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
    private environment: Environment
  ) {}

  async userToProfile(id: string) {
    const {
      latestUpdateNotifcation,
      notificationsLevel,
      steamId,
      fun: {
        payload: { feetPushed },
      },
    } = await this.findUser({ id });

    const user = await client.users.fetch(id);

    const roles = [];

    if (this.environment.owners.includes(id)) roles.push("admin");
    if (await this.isBetaTester(id)) roles.push("betatester");

    return new Profile({
      id,
      steamId,
      roles,
      username: user.tag,
      lastUpdate: latestUpdateNotifcation,
      notificationsLevel: notificationsLevel,
      avatar: user.displayAvatarURL(),
      pushcartPoints: parseInt(feetPushed, 10),
    });
  }

  async findUser(query: FilterQuery<UserDocument>): Promise<User> {
    return plainToClass(
      User,
      await this.userModel.findOne(query).orFail().lean().exec()
    );
  }

  async updateUser(id: string, query: UpdateQuery<User>): Promise<User> {
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
    await this.userModel.create({
      id,
      accessToken,
      refreshToken,
    });

    return await this.findUser({ id });
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
