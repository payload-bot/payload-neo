import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { plainToClass } from "class-transformer";
import { generate } from "generate-password";
import type { Model } from "mongoose";
import {
  Webhook,
  WebhookDocument,
  WebhookTargetType,
} from "../models/webhook.model";

@Injectable()
export class WebhookCrudService {
  constructor(
    @InjectModel(Webhook.name)
    private webhookModel: Model<WebhookDocument>
  ) {}

  async getWebhookByDiscordId(id: string) {
    const webhook = await this.webhookModel
      .findOne({ id })
      .orFail()
      .lean()
      .exec();

    return plainToClass(Webhook, webhook);
  }

  async getWebhookByObjectId(id: string) {
    const webhook = await this.webhookModel.findById(id).orFail().lean().exec();

    return plainToClass(Webhook, webhook);
  }

  async getWebhookBySecret(secret: string) {
    const webhook = await this.webhookModel
      .findById({ value: secret })
      .orFail()
      .lean()
      .exec();

    return plainToClass(Webhook, webhook);
  }

  async deleteWebhookByDiscordId(id: string) {
    await this.webhookModel.findOneAndRemove({ id }).orFail().lean().exec();
  }

  async createNewWebhook(type: WebhookTargetType, id: string) {
    const createdWebhook = await this.webhookModel.create({
      id,
      type,
      value: generate({
        length: 40,
        numbers: true,
        strict: true,
      }),
    });

    return plainToClass(Webhook, createdWebhook);
  }
}
