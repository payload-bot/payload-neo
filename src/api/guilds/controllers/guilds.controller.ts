import { CurrentUser } from "#api/auth/decorators/current-user.decorator";
import { Auth } from "#api/auth/guards/auth.guard";
import type { User } from "#api/users/models/user.model";
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  UseInterceptors,
} from "@nestjs/common";
import { container } from "@sapphire/framework";
import { UpdateGuildDto } from "../dto/update-guild.dto";
import { GuildAuth } from "../guards/guild-auth.guard";
import { GuildsService } from "../services/guilds.service";

const { i18n } = container;

@Controller("guilds")
@UseInterceptors(ClassSerializerInterceptor)
export class GuildsController {
  constructor(private guildsService: GuildsService) {}

  @Get()
  @Auth()
  async getAuthedGuilds(@CurrentUser() { id }: User) {
    return await this.guildsService.getUserGuilds(id);
  }

  @Get("languages")
  async getValidLanguages() {
    return [...i18n.languages.keys()];
  }

  @Get(":guildId")
  @GuildAuth()
  async getGuild(@Param("guildId") guildId: string) {
    return await this.guildsService.getUserGuild(guildId);
  }

  @Patch(":guildId")
  @GuildAuth()
  async updateGuild(
    @Param("guildId") guildId: string,
    @Body() body: UpdateGuildDto
  ) {
    return await this.guildsService.updateGuildById(guildId, body);
  }
}
