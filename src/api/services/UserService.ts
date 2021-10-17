import { User, UserModel } from "#lib/models//User";
import type { UpdateQuery } from "mongoose";

type UserUpdateDetails = {
  steamID?: string;
  notificationsLevel?: number;
};

export default class UserService {
  constructor() {}

  async getUserByDiscordId(id: string): Promise<UserModel> {
    return await User.findOne({ id }, {}, { upsert: true }) as UserModel;
  }

  async findByDiscordIdAndUpdate(
    id: string,
    details: UpdateQuery<UserUpdateDetails>
  ): Promise<UserModel> {
    return await User.findOneAndUpdate({ id }, details, { new: true, upsert: true });
  }

  async saveTokensToUser(
    id: string,
    accessToken: string,
    refreshToken: string
  ): Promise<UserModel> {
    return await User.findOneAndUpdate(
      { id },
      {
        accessToken,
        refreshToken,
      },
      {
        new: true,
        upsert: true,
      }
    );
  }
}
