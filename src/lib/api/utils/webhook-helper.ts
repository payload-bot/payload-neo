import config from "#root/config";
import { EmbedColors } from "#utils/colors";
import { capturePage } from "#utils/screenshot";
import {
  type Client,
  MessageAttachment,
  MessageEmbed,
  type TextChannel,
  type User,
  Permissions,
} from "discord.js";

type TargetReturnType = TextChannel | User | null;
type WebhookTargetType = "channels" | "users";

export async function checkTarget(
  client: Client,
  target: WebhookTargetType,
  id: string
) {
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

export async function sendLogPreview(
  client: Client,
  scope: WebhookTargetType,
  id: string,
  logsId: string
) {
  const target = (await client[scope]
    .fetch(id)
    .catch(() => null)) as TargetReturnType;

  if (!target) {
    throw new Error("Bad discord target id");
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
    await sendWebhook(target, embed, att);
  } catch (err) {
    throw err;
  }
}

export async function sendTest(client: Client, scope: WebhookTargetType, id: string) {
  const target = (await client[scope]
    .fetch(id)
    .catch(() => null)) as TargetReturnType;

  if (!target) {
    throw new Error("Bad discord target id");
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
    await sendWebhook(target, embed);
  } catch (err) {
    throw err;
  }
}

async function sendWebhook(
  target: TextChannel | User,
  embed: MessageEmbed,
  attachment?: MessageAttachment
) {
  return await target.send({
    embeds: [embed],
    files: attachment ? [attachment] : undefined,
  });
}
