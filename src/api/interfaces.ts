import DiscordStrategy from "passport-discord";
import { ServerModel } from "../lib/model/Server";
import { UserModel } from "../lib/model/User";

export type AuthedUser = {
	accessToken: string;
	refreshToken: string;
	user: UserModel;
	profile: AuthedUserProfile;
};

export type AuthedRequest = {
	id: string;
	isAdmin: boolean;
	iat: number;
};

export interface AuthedUserProfile extends DiscordStrategy.Profile {
	avatarUrl: string;
	fullName: string;
	isAdmin: boolean;
}

export interface AuthedUserServer extends DiscordStrategy.GuildInfo {
	isPayloadIn: boolean;
	iconUrl: string | null;
	server?: ServerModel;
}

declare global {
	namespace Express {
		interface User extends AuthedRequest {}
		interface Request {
			guild?: ServerModel;
		}
	}
}
