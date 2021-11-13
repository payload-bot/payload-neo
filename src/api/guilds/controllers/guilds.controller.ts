import { CurrentUser } from "#api/auth/decorators/current-user.decorator";
import { Auth } from "#api/auth/guards/auth.guard";
import type { User } from "#api/users/models/user.model";
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseInterceptors,
} from "@nestjs/common";
import { GuildsService } from "../services/guilds.service";

@Controller("guilds")
@UseInterceptors(ClassSerializerInterceptor)
export class GuildsController {
  constructor(private guildsService: GuildsService) {}

  @Get()
  @Auth()
  async getAuthedGuilds(@CurrentUser() { id }: User) {
    return await this.guildsService.getUserGuilds(id);
  }

  @Get(":guildId")
  @Auth()
  async getGuild(
    @CurrentUser() { id }: User,
    @Param("guildId") guildId: string
  ) {
    return await this.guildsService.getUserGuild(id, guildId);
  }
}
