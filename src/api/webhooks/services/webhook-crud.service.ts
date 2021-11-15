import { GuildsService } from "#api/guilds/services/guilds.service";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { plainToClass } from "class-transformer";
import { generate } from "generate-password";
import type { Model, Types } from "mongoose";
import {
  Webhook,
  WebhookDocument,
  WebhookTargetType,
} from "../models/webhook.model";

@Injectable()
export class WebhookCrudService {
  constructor(
    @InjectModel(Webhook.name)
    private webhookModel: Model<WebhookDocument>,
    private guildsService: GuildsService
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
      .findOne({ value: secret })
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

    if (type === "channels") {
      await this.saveWebhookToGuild(id, createdWebhook._id);
    }

    return plainToClass(
      Webhook,
      await this.getWebhookByObjectId(createdWebhook._id)
    );
  }

  private async saveWebhookToGuild(guildId: string, webhookId: Types.ObjectId) {
    await this.guildsService.updateGuildById(guildId, { webhook: webhookId });
  }
}
