import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class Environment {
  constructor(private configService: ConfigService) {}

  get nodeEnv() {
    return this.configService.get<string>("NODE_ENV") as string;
  }

  get mongoDbUri() {
    return this.configService.get<string>("MONGO_URI") as string;
  }

  get redisUrl() {
    return this.configService.get<string>("REDIS_URL");
  }

  get clientUrl() {
    return this.configService.get<string>("CLIENT_URL") as string;
  }

  get clientSecret() {
    return this.configService.get<string>("CLIENT_SECRET") as string;
  }

  get clientId() {
    return this.configService.get<string>("CLIENT_ID") as string;
  }

  get callbackUrl() {
    return this.configService.get<string>("CALLBACK_URL") as string;
  }

  get owners() {
    return this.configService.get<string[]>("OWNERS") as string[];
  }

  get discordId() {
    return this.configService.get<string>("DISCORD_GUILD_ID") as string;
  }

  get discordBetaRoleId() {
    return this.configService.get<string>(
      "DISCORD_GUILD_BETA_ROLE_ID"
    ) as string;
  }

  get sessionSecret() {
    return this.configService.get<string>("SESSION_SECRET") as string;
  }

  get cookieDomain() {
    return this.configService.get<string>("COOKIE_DOMAIN") as string;
  }

  get cookieSecret() {
    return this.configService.get<string>("COOKIE_SECRET") as string;
  }
}
