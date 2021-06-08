import DiscordStrategy from "passport-discord";
import config from "../config";
import { User, UserModel } from "../lib/model/User";
import AuthedUser, { AuthedUserProfile } from "../lib/types/DiscordAuth";

export default function createDiscordStrategy() {
	return new DiscordStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: process.env.CALLBACK_URL,
			scope: ["identify", "guilds"],
		},
		async (accessToken, refreshToken, profile, cb) => {
			let user: UserModel;
			try {
				user = await User.findOne({ id: profile.id });
			} catch (err) {
				const newUser = new User({
					id: profile.id
				});

				await newUser.save();

				user = newUser;
			}

			const { guilds, ...userProfile }: AuthedUserProfile = {
				avatarUrl: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`,
				fullName: `${profile.username}#${profile.discriminator}`,
				isAdmin: config.allowedID === profile.id,
				...profile
			};

			const returnObject: AuthedUser = {
				user,
				profile: userProfile,
				accessToken,
				refreshToken
			};

			cb(null, returnObject);
		}
	)
}