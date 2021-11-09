import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class Environment {
  constructor(private configService: ConfigService) {}

  get mongoDbUri() {
    return this.configService.get<string>("MONGO_URI") as string;
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

  get jwtAuthSecret() {
    return this.configService.get<string>("JWT_AUTH_SECRET") as string;
  }

  get jwtRefreshSecret() {
    return this.configService.get<string>("JWT_REFRESH_SECRET") as string;
  }
}
