import { EmbedColors } from "#utils/colors.ts";
import { container } from "@sapphire/pieces";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, type Client, EmbedBuilder, type MessageComponent, PermissionFlagsBits, type TextChannel, type User } from "discord.js";
import { Buffer } from "node:buffer";

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

  const preview = await fetch(
    `${Deno.env.get("PREVIEW_URL")!}/v0/logstf`,
    {
      method: "POST",
      body: JSON.stringify({ url: logsUrl }),
    },
  );

  const arrayBuffer = await preview.arrayBuffer();

  const att = new AttachmentBuilder(Buffer.from(arrayBuffer), { name: "log.webp" });

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

  const components = [];

  if (demosId != null) {
    const demosTfUrl = `https://demos.tf/${demosId}`;

    components.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder().setURL(demosTfUrl).setLabel("Link to Demo").setStyle(ButtonStyle.Link),
      ]),
    );
  }

  try {
    await sendWebhook(target, embed, att, components);
  } catch (err) {
    throw err;
  }
}

export async function sendTest(client: Client, scope: WebhookTargetType, id: string) {
  if (id == null) {
    return false;
  }

  const target = (await client[scope].fetch(id).catch(() => null)) as TargetReturnType;

  if (target == null) {
    return false;
  }

  const embed = new EmbedBuilder({
    title: "Webhook Test",
    description: "You will receive log previews in this channel",
    footer: {
      text: "Rendered from Webhook",
    },
    color: EmbedColors.Green,
    timestamp: new Date(),
  });

  try {
    const data = await sendWebhook(target, embed, null, null);
    return data != null;
  } catch (err) {
    container.logger.error(err);
    return false;
  }
}

async function sendWebhook(
  target: TextChannel | User,
  embed: EmbedBuilder,
  attachment: AttachmentBuilder | null,
  components: MessageComponent[] | null,
) {
  return await target.send({
    embeds: [embed],
    files: attachment ? [attachment] : undefined,
    // deno-lint-ignore no-explicit-any
    components: components as any,
  });
}
