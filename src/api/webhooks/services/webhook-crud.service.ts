import { GuildsService } from "#api/guilds/services/guilds.service";
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
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
      .lean()
      .exec();

    if (!webhook) {
      throw new UnauthorizedException(
        "The provided webhook secret is not valid"
      );
    }
    
    return plainToClass(Webhook, webhook);
  }

  async deleteUserWebhook(id: string) {
    await this.webhookModel.findOneAndRemove({ id }).orFail();
  }

  async deleteGuildWebhook(id: string, guildId: string) {
    await Promise.all([
      this.webhookModel.findOneAndRemove({ id }).orFail(),
      this.removeWebhookFromGuild(guildId),
    ]);
  }

  async createNewWebhook(
    type: WebhookTargetType,
    id: string,
    guildId?: string
  ) {
    if (await this.webhookModel.findOne({ id })) {
      throw new BadRequestException("You cannot add another webhook");
    }

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
      await this.saveWebhookToGuild(guildId!, createdWebhook._id);
    }

    return await this.getWebhookByObjectId(createdWebhook._id.toString());
  }

  private async saveWebhookToGuild(guildId: string, webhookId: Types.ObjectId) {
    await this.guildsService.updateGuildById(guildId, { webhook: webhookId });
  }

  private async removeWebhookFromGuild(guildId: string) {
    await this.guildsService.updateGuildById(guildId, {
      $unset: { webhook: 1 },
    });
  }
}
