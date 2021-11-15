import { GuildsModule } from "#api/guilds/guilds.module";
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WebhookCrudController } from "./controllers/webhook-crud.controller";
import { WebhookController } from "./controllers/webhook.controller";
import { WebhookValidationMiddleware } from "./middleware/webhook.middleware";
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
  exports: [WebhookCrudService, WebhookService],
})
export class WebhooksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(WebhookValidationMiddleware)
      .forRoutes(
        { path: "*/test", method: RequestMethod.POST },
        { path: "*/logs", method: RequestMethod.POST }
      );
  }
}
