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
    private userService: UserService
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

      return await this.userService.updateUser(profile.id, {
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (error instanceof Error.DocumentNotFoundError) {
        return await this.userService.createUser({
          id: profile.id,
          accessToken,
          refreshToken,
        });
      } else {
        throw error;
      }
    }
  }
}
