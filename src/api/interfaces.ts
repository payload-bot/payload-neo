import DiscordStrategy from "passport-discord";
import { ServerModel } from "../lib/model/Server";
import { UserModel } from "../lib/model/User";

export type DiscordUserDetails = {
    accessToken: string;
    refreshToken: string;
    user: UserModel;
    profile: DiscordProfile;
};

export type AuthedRequest = {
    id: string;
    iat: number;
};

export interface DiscordProfile extends DiscordStrategy.Profile {
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
