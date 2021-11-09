import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { plainToClass } from "class-transformer";
import type { FilterQuery, Model, UpdateQuery } from "mongoose";
import { User, UserDocument } from "../models/user.model";

export interface CreateUserParams {
  id: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
  ) {}

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
}
