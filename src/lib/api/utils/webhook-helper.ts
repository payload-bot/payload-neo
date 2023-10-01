import config from "#root/config";
import { EmbedColors } from "#utils/colors";
import { capturePage } from "#utils/screenshot";
import {
  type Client,
  type TextChannel,
  type User,
  type MessageComponent,
  ChannelType,
  PermissionFlagsBits,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

type TargetReturnType = TextChannel | User | null;
type WebhookTargetType = "channels" | "users";

type LogPreviewArgs = {
  webhookTarget: WebhookTargetType;
  targetId: string;
  logsId: string;
  demosId?: string | null;
};

export async function checkTarget(client: Client, target: WebhookTargetType, id: string) {
  if (target === "users") {
    return true;
  }

  const targetTextChannel = await client.channels.fetch(id).catch(() => null);

  if (!targetTextChannel) {
    // Targeted channel does not exist
    return false;
  }

  // Targeted channel is not a text channel
  if (!targetTextChannel.isTextBased()) {
    return false;
  }

  if (targetTextChannel.type !== ChannelType.GuildText) {
    return false;
  }

  const member = await (await client.guilds.fetch(targetTextChannel.guild.id)).members.fetch({ user: client.id! });

  // I'm not in this guild?
  if (!member) {
    return false;
  }

  if (!targetTextChannel.permissionsFor(member).has(PermissionFlagsBits.SendMessages)) {
    return false;
  }

  return true;
}

export async function sendLogPreview(client: Client, { logsId, targetId, demosId, webhookTarget }: LogPreviewArgs) {
  const target = (await client[webhookTarget].fetch(targetId).catch(() => null)) as TargetReturnType;

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

  const att = new AttachmentBuilder(screenshotBuffer, { name: "log.png" });

  const embed = new EmbedBuilder({
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

  let components = [];

  if (demosId != null) {
    const demosTfUrl = `https://demos.tf/${demosId}`;

    components.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder().setURL(demosTfUrl).setLabel("Link to Demo").setStyle(ButtonStyle.Link),
      ])
    );
  }

  try {
    await sendWebhook(target, embed, att, components);
  } catch (err) {
    throw err;
  }
}

export async function sendTest(client: Client, scope: WebhookTargetType, id: string) {
  const target = (await client[scope].fetch(id).catch(() => null)) as TargetReturnType;

  if (target == null) {
    throw new Error("Bad discord target id");
  }

  const embed = new EmbedBuilder({
    title: "Webhook Test",
    description: "Successful webhook test!",
    footer: {
      text: "Rendered from Webhook",
    },
    color: EmbedColors.Green,
    timestamp: new Date(),
  });

  try {
    await sendWebhook(target, embed, null, null);
  } catch (err) {
    throw err;
  }
}

async function sendWebhook(
  target: TextChannel | User,
  embed: EmbedBuilder,
  attachment: AttachmentBuilder | null,
  components: MessageComponent[] | null
) {
  return await target.send({
    embeds: [embed],
    files: attachment ? [attachment] : undefined,
    components: components as any,
  });
}
