import { User, UserModel } from "../../lib/model/User";

export default class UserService {
	constructor() {}

	async getUserByDiscordId(id: string): Promise<UserModel> {
		return await User.findOne({ id: id });
	}

	async saveTokensToUser(
		id: string,
		accessToken: string,
		refreshToken: string
	): Promise<UserModel> {
		return await User.findOneAndUpdate(
			{ id: id },
			{
				accessToken,
				refreshToken
			},
			{
				new: true
			}
		);
	}
}
