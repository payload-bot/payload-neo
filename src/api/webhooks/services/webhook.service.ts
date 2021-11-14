import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Webhook, WebhookDocument } from "../models/webhook.model";

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(Webhook.name)
    private webhookModel: Model<WebhookDocument>
  ) {}

  
}
