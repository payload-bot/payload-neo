import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CurrentWebhook } from "../decorators/get-webhook.decorator";
import { WebhookLogDto } from "../dto/webhook-log.dto";
import type { Webhook } from "../models/webhook.model";
import { WebhookService } from "../services/webhook.service";

@Controller("webhooks")
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post("logs")
  @HttpCode(HttpStatus.NO_CONTENT)
  async getUserWebhook(
    @CurrentWebhook() { id, type }: Webhook,
    @Body() { logsId }: WebhookLogDto
  ) {
    await this.webhookService.sendLogPreview(type, id, logsId);
    return;
  }

  @Post("test")
  @HttpCode(HttpStatus.NO_CONTENT)
  async getServerWebhook(@CurrentWebhook() { id, type }: Webhook) {
    await this.webhookService.sendTest(type, id);
    return;
  }
}
