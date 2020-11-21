import DiscordStrategy from "passport-discord";
import { UserModel } from "../model/User";
import { ServerModel } from "../model/Server";

export type AuthedUser = {
	access_token: string,
	refresh_token: string,
	user: UserModel;
	profile: AuthedUserProfile;
	guilds: AuthedUserServer[];
};

export interface AuthedUserProfile extends DiscordStrategy.Profile {
	avatarUrl: string;
	fullName: string;
	isAdmin: boolean;
}

export interface AuthedUserServer extends DiscordStrategy.GuildInfo {
	isPayloadIn: boolean;
	iconUrl: string;
	db?: ServerModel;
}

export type AuthedRequest = {
	id: string;
	isAdmin: boolean;
	token: string,
	iat: number;
};

export default AuthedUser;
