import type { ServerModel } from "#lib/models//Server";
import type { UserModel } from "#lib/models//User";
import type DiscordStrategy from "passport-discord";

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
            webhook_type?: "users" | "channels";
            webhook_id?: string;
        }
    }
}
