import config from "#root/config";
import { EmbedColors } from "#utils/colors";
import { capturePage } from "#utils/screenshot";
import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { container } from "@sapphire/framework";
import {
  MessageAttachment,
  MessageEmbed,
  Permissions,
  TextChannel,
  User,
} from "discord.js";
import type { WebhookTargetType } from "../models/webhook.model";

const { client } = container;

type TargetReturnType = TextChannel | User | null;

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);

  // FIXME: This is a temporary solution- Move to *actual* discord webhooks
  async checkTarget(target: WebhookTargetType, id: string) {
    if (target === "users") {
      return true;
    }

    const targetTextChannel = await client.channels.fetch(id).catch(() => null);

    if (!targetTextChannel) {
      // Targeted channel does not exist
      return false;
    }

    // Targeted channel is not a text channel
    if (!targetTextChannel.isText()) {
      return false;
    }

    if (targetTextChannel.type !== "GUILD_TEXT") {
      return false;
    }

    const member = (await client.guilds.fetch(targetTextChannel.guild.id)).me;

    // I'm not in this guild?
    if (!member) {
      return false;
    }

    if (
      !targetTextChannel
        .permissionsFor(member)
        .has(Permissions.FLAGS.SEND_MESSAGES)
    ) {
      return false;
    }

    return true;
  }

  async sendLogPreview(scope: WebhookTargetType, id: string, logsId: string) {
    const target = (await client[scope]
      .fetch(id)
      .catch(() => null)) as TargetReturnType;

    if (!target) {
      throw new BadRequestException("Bad discord target id");
    }

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
      color: EmbedColors.Green,
      timestamp: new Date(),
    });

    try {
      await this.sendWebhook(target, embed, att);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException();
    }
  }

  async sendTest(scope: WebhookTargetType, id: string) {
    const target = (await client[scope]
      .fetch(id)
      .catch(() => null)) as TargetReturnType;

    if (!target) {
      throw new BadRequestException("Bad discord target id");
    }

    const embed = new MessageEmbed({
      title: "Webhook Test",
      description: "Successful webhook test!",
      footer: {
        text: "Rendered from Webhook",
      },
      color: EmbedColors.Green,
      timestamp: new Date(),
    });

    try {
      await this.sendWebhook(target, embed);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException();
    }
  }

  private async sendWebhook(
    target: TextChannel | User,
    embed: MessageEmbed,
    attachment?: MessageAttachment
  ) {
    return await target.send({
      embeds: [embed],
      files: attachment ? [attachment] : undefined,
    });
  }
}
