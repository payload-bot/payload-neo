import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WebhookController } from "./controllers/webhook.controller";
import { Webhook, WebhookSchema } from "./models/webhook.model";
import { WebhookService } from "./services/webhook.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }]),
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhooksModule {}
