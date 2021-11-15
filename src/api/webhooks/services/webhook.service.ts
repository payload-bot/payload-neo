import { EmbedColors } from "#utils/colors";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { container } from "@sapphire/framework";
import { MessageEmbed, TextChannel, User } from "discord.js";
import type { WebhookTargetType } from "../models/webhook.model";

const { client } = container;

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);

  async sendLogPreview(scope: WebhookTargetType, id: string) {
    const target = (await client[scope].fetch(id)) as TextChannel | User;

    if (!target) throw new NotFoundException();

    const embed = new MessageEmbed({
      title: "Webhook Test",
      description: "Successful webhook test!",
      footer: {
        text: "Rendered from Webhook",
      },
      color: EmbedColors.GREEN,
      timestamp: new Date(),
    });

    await this.sendWebhook(target, embed);
  }

  async sendTest(scope: WebhookTargetType, id: string) {
    const target = (await client[scope].fetch(id)) as TextChannel | User;

    if (!target) throw new NotFoundException();

    const embed = new MessageEmbed({
      title: "Webhook Test",
      description: "Successful webhook test!",
      footer: {
        text: "Rendered from Webhook",
      },
      color: EmbedColors.GREEN,
      timestamp: new Date(),
    });

    await this.sendWebhook(target, embed);
  }

  private async sendWebhook(target: TextChannel | User, embed: MessageEmbed) {
    try {
      await target.send({ embeds: [embed] });
    } catch (_err) {
      this.logger.error(_err);
      throw new InternalServerErrorException();
    }
  }
}
