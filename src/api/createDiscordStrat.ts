import DiscordStrategy from "passport-discord";
import config from "../config";
import { User, UserModel } from "../lib/model/User";
import { AuthedUserProfile, AuthedUser } from "./interfaces";

export default function createDiscordStrategy() {
	return new DiscordStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: process.env.CALLBACK_URL,
			scope: ["identify", "guilds", "connections"]
		},
		async (accessToken, refreshToken, profile, cb) => {
			let user: UserModel;

			user = await User.findOne({ id: profile.id });

			if (!user) {
				user = await User.create({
					id: profile.id
				});
			}

			const { guilds, ...userProfile }: AuthedUserProfile = {
				avatarUrl: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`,
				fullName: `${profile.username}#${profile.discriminator}`,
				isAdmin: config.allowedID === profile.id,
				...profile
			};

			const returnObject: AuthedUser = {
				profile: userProfile,
				accessToken,
				refreshToken,
				user
			};

			cb(null, returnObject as any);
		}
	);
}
