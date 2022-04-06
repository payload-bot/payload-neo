import { DiscordService } from "#api/discord/services/discord.service";
import { Environment } from "#api/environment/environment";
import { UserService } from "#api/users/services/user.service";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Error } from "mongoose";
import { Strategy, Profile } from "passport-discord";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly environment: Environment,
    private userService: UserService,
    private discordService: DiscordService
  ) {
    super({
      clientID: environment.clientId,
      clientSecret: environment.clientSecret,
      callbackURL: environment.callbackUrl,
      scope: ["identify", "guilds", "connections"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    try {
      await this.userService.findUser({ id: profile.id });

      const user = await this.userService.updateUser(profile.id, {
        accessToken,
        refreshToken,
      });

      await this.discordService.cacheUserServers(profile.id, profile.guilds!);

      return user;
    } catch (error) {
      if (error instanceof Error.DocumentNotFoundError) {
        const user = await this.userService.createUser({
          id: profile.id,
          accessToken,
          refreshToken,
        });

        await this.discordService.cacheUserServers(profile.id, profile.guilds!);

        return user;
      } else {
        throw error;
      }
    }
  }
}
