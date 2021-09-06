import { Router } from "express";
import { container } from "@sapphire/framework";
import { User } from "#/lib/models/User";
import { WebhookModel, Webhook } from "#/lib/models/Webhook";
import { Server } from "#/lib/models/Server";
import checkAuth from "../../middleware/checkAuth";
import checkServers from "../../middleware/checkServers";
import UserService from "../../services/UserService";
import WebhookService from "../../services/WebhookService";

const { client } = container;

const webhookService = new WebhookService();
const userService = new UserService();

async function createWebhook(
  type: "users" | "channels",
  id: string,
  _id: string
): Promise<WebhookModel | null> {
  if (type === "channels") {
    const server = await Server.findById(_id);

    if (server!.webhook) return null;
    const webhook = await webhookService.createNewWebhook(type, id);
    server!.webhook = webhook._id;
    await (server as any).save();
    return webhook;
  } else {
    const user = await User.findById(_id);

    if (user!.webhook) return null;
    const webhook = await webhookService.createNewWebhook(type, id);
    user!.webhook = webhook._id;
    await (user as any).save();
    return webhook;
  }
}

/*
    Reasons for putting checkAuth on each route:
    1) It interferes with other routes, like /internal/logs
    2) It checks authentication globally, for the whole namespace

    Two things I don't want. To fix this, just put it in the middleware for specific routes.

    Ideally my routes should just be named better, but what gives. This will be rewritten anyways probably.
*/

const router = Router();

router.post("/users", checkAuth, async (req, res) => {
  const { _id } = await userService.getUserByDiscordId(req.user!.id);
  const createdWebhook = await createWebhook("users", req.user!.id, _id);

  if (!createdWebhook) {
    return res.status(400).json({
      status: 400,
      message: "You already have a webhook created",
    });
  }

  return res.status(201).json(createdWebhook.toJSON());
});

router.delete("/users", checkAuth, async (req, res) => {
  const { id, webhook } = await userService.getUserByDiscordId(req.user!.id);
  const webhookFull = await webhookService.getWebhookById(webhook!);

  if (!webhookFull) {
    return res.status(400).json({
      status: 400,
      error: "Bad request",
      message: "You don't have a webhook to delete",
    });
  }

  const user = await userService.getUserByDiscordId(id);

  await Webhook.findByIdAndRemove(webhook);

  user!.webhook = undefined;

  await user.save();

  return res.status(204).send();
});

router.post("/guilds/:guildId", checkAuth, checkServers, async (req, res) => {
  const _id = (req.guild as any)._id;
  const channelId = req.body.channelId;

  if (!channelId)
    return res
      .status(400)
      .json({ status: 400, message: "No channel id provided" });

  const isChannelInGuild = await client.channels.fetch(channelId);

  if (!isChannelInGuild || isChannelInGuild.type !== "GUILD_TEXT") {
    return res.status(400).json({ status: 400, message: "Bad request" });
  }

  const createdWebhook = await createWebhook("channels", channelId, _id);

  if (!createdWebhook) {
    return res.status(400).json({
      status: 400,
      message: "You already have a webhook created",
    });
  }

  return res.status(201).json(createdWebhook.toJSON());
});

router.delete("/guilds/:guildId", checkAuth, checkServers, async (req, res) => {
  const guild = req.guild;

  const webhookFull = await webhookService.getWebhookById(
    guild!.webhook as string
  );

  if (!webhookFull) {
    return res.status(400).json({
      status: 400,
      error: "Bad request",
      message: "You don't have a webhook to delete",
    });
  }

  await Webhook.findByIdAndRemove(guild!.webhook);
  guild!.webhook = undefined;

  await (guild as any).save();

  return res.status(204).send();
});

export default router;
