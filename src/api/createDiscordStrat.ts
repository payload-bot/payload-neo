import DiscordStrategy from "passport-discord";
import { User, UserModel } from "#/lib/models/User";
import type { DiscordProfile, DiscordUserDetails } from "./interfaces";

export default function createDiscordStrategy() {
  return new DiscordStrategy(
    {
      clientID: process.env.CLIENT_ID as string,
      clientSecret: process.env.CLIENT_SECRET as string,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["identify", "guilds", "connections"],
    },
    async (accessToken, refreshToken, profile, cb) => {
      const user = await User.findOne({ id: profile.id }, {}, { upsert: true }) as UserModel;

      const { guilds, ...userProfile }: DiscordProfile = {
        avatarUrl: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`,
        ...profile,
      };

      const returnObject: DiscordUserDetails = {
        profile: userProfile,
        accessToken,
        refreshToken,
        user,
      };

      cb(null, returnObject as any);
    }
  );
}
