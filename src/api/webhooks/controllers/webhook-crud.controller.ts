import { CurrentUser } from "#api/auth/decorators/current-user.decorator";
import { Auth } from "#api/auth/guards/auth.guard";
import { GuildAuth } from "#api/guilds/guards/guild-auth.guard";
import { GuildsService } from "#api/guilds/services/guilds.service";
import type { User } from "#api/users/models/user.model";
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { GuildWebhookCreateDto } from "../dto/webhook-create-guild.dto";
import { WebhookCrudService } from "../services/webhook-crud.service";

@Controller("webhooks")
@UseInterceptors(ClassSerializerInterceptor)
export class WebhookCrudController {
  constructor(
    private webhookService: WebhookCrudService,
    private guildsService: GuildsService
  ) {}

  @Get("users")
  @Auth()
  async getUserWebhook(@CurrentUser() { id }: User) {
    return await this.webhookService.getWebhookByDiscordId(id);
  }

  @Get("guilds/:guildId")
  @GuildAuth()
  async getServerWebhook(@Param("guildId") id: string) {
    return await this.guildsService.getGuildWebhook(id);
  }

  @Post("users")
  @Auth()
  async createUserWebhook(@CurrentUser() { id }: User) {
    return await this.webhookService.createNewWebhook("users", id);
  }

  @Post("guilds/:guildId")
  @GuildAuth()
  async createServerWebhook(
    @Param("guildId") guildId: string,
    @Body() { channelId }: GuildWebhookCreateDto
  ) {
    return await this.webhookService.createNewWebhook(
      "channels",
      channelId,
      guildId
    );
  }

  @Delete("users")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  async deleteUserWebhook(@CurrentUser() { id }: User) {
    await this.webhookService.deleteUserWebhook(id);
    return;
  }

  @Delete("guilds/:guildId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @GuildAuth()
  async deleteServerWebhook(@Param("guildId") guildId: string) {
    const webhook = await this.guildsService.getGuildWebhook(guildId);
    await this.webhookService.deleteGuildWebhook(webhook.id, guildId);
    return;
  }
}
