import { User, UserModel } from "../../lib/model/User";

type UserUpdateDetails = {
    steamID?: string;
    notificationsLevel?: number;
}

export default class UserService {
    constructor() {}

    async getUserByDiscordId(id: string): Promise<UserModel> {
        return await User.findOne({ id });
    }

    async findByDiscordIdAndUpdate(id: string, details: Partial<UserUpdateDetails>): Promise<UserModel> {
        return await User.findOneAndUpdate({ id }, details, { new: true });
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
            }
        );
    }
}
