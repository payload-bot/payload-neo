import { GuildsModule } from "#api/guilds/guilds.module";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WebhookCrudController } from "./controllers/webhook-crud.controller";
import { WebhookController } from "./controllers/webhook.controller";
import { Webhook, WebhookSchema } from "./models/webhook.model";
import { WebhookCrudService } from "./services/webhook-crud.service";
import { WebhookService } from "./services/webhook.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }]),
    GuildsModule,
  ],
  controllers: [WebhookCrudController, WebhookController],
  providers: [WebhookCrudService, WebhookService],
  exports: [WebhookCrudService],
})
export class WebhooksModule {}