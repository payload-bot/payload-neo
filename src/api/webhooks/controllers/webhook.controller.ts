import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { WebhookService } from "../services/webhook.service";

@Controller("webhooks")
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post("logs")
  @HttpCode(HttpStatus.NO_CONTENT)
  async getUserWebhook() {
    await this.webhookService.sendLogPreview("channels", "");
    return;
  }

  @Post("test")
  @HttpCode(HttpStatus.NO_CONTENT)
  async getServerWebhook() {
    await this.webhookService.sendTest("channels", "");
    return;
  }
}
