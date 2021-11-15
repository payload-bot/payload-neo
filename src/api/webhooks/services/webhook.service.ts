import config from "#root/config";
import { EmbedColors } from "#utils/colors";
import { capturePage } from "#utils/screenshot";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { container } from "@sapphire/framework";
import { MessageAttachment, MessageEmbed, TextChannel, User } from "discord.js";
import type { WebhookTargetType } from "../models/webhook.model";

const { client } = container;

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);

  async sendLogPreview(scope: WebhookTargetType, id: string, logsId: string) {
    const target = (await client[scope].fetch(id)) as TextChannel | User;

    if (!target) throw new NotFoundException();

    const logsUrl = `https://logs.tf/${logsId}`;

    const screenshotBuffer = await capturePage(logsUrl, {
      top: {
        selector: "#log-header",
        edge: "top",
      },
      left: {
        selector: "#log-header",
        edge: "left",
      },
      right: {
        selector: "#log-header",
        edge: "right",
      },
      bottom: {
        selector: "#log-section-players",
        edge: "bottom",
      },

      cssPath: config.files.LOGS_CSS,
    });

    const att = new MessageAttachment(screenshotBuffer, "log.png");

    const embed = new MessageEmbed({
      title: "Logs.tf Preview",
      footer: {
        text: "Rendered from Webhook",
      },
      image: {
        url: "attachment://log.png",
      },
      url: logsUrl,
      color: EmbedColors.GREEN,
      timestamp: new Date(),
    });

    await this.sendWebhook(target, embed, att);
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

  private async sendWebhook(
    target: TextChannel | User,
    embed: MessageEmbed,
    attachment?: MessageAttachment
  ) {
    try {
      await target.send({
        embeds: [embed],
        files: attachment ? [attachment] : undefined,
      });
    } catch (_err) {
      this.logger.error(_err);
      throw new InternalServerErrorException();
    }
  }
}
