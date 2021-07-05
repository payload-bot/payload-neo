import { Router } from "express";
import checkAuth from "../../middleware/checkAuth";
import {WebhookModel } from "../../../lib/model/Webhook";
import checkServers from "../../middleware/checkServers";
import UserService from "../../services/UserService";
import { Server } from "../../../lib/model/Server";
import { User } from "../../../lib/model/User";
import client from "../../..";
import WebhookService from "../../services/WebhookService";

const webhookService = new WebhookService();

async function createWebhook(
    type: "users" | "channels",
    id: string,
    _id: string
): Promise<WebhookModel | null> {
    if (type === "channels") {
        const server = await Server.findById(_id);

        if (server.webhook) return null;
        const webhook = await webhookService.createNewWebhook(type, id);
        server.webhook = webhook._id;
        await server.save();
        return webhook;
    } else {
        const user = await User.findById(_id);

        if (user.webhook) return null;
        const webhook = await webhookService.createNewWebhook(type, id);
        user.webhook = webhook._id;
        await user.save();
        return webhook;
    }
}

const userService = new UserService();

const router = Router();

router.use(checkAuth);

router.post("/users/create", async (req, res) => {
    const { _id } = await userService.getUserByDiscordId(req.user.id);
    const createdWebhook = await createWebhook("users", req.user.id, _id);

    if (!createdWebhook) {
        return res.status(400).json({
            status: 400,
            message: "You already have a webhook created",
        });
    }

    res.status(201).json({
        status: 201,
        message: "Created",
        data: createdWebhook.value,
    });
});

router.post("/guilds/:guildId/create", checkServers, async (req, res) => {
    const { _id } = req.guild;
    const channelId = req.body.channelId;

    if (!channelId) return res.status(400).json({ status: 400, message: "No channel id provided" });

    const isChannelInGuild =
        client.channels.cache.get(channelId) ?? (await client.channels.fetch(channelId));

    if (!isChannelInGuild || isChannelInGuild.type !== "text")
        return res.status(400).json({ status: 400, message: "Bad request" });

    const createdWebhook = await createWebhook("channels", channelId, _id);

    if (!createdWebhook) {
        return res.status(400).json({
            status: 400,
            message: "You already have a webhook created",
        });
    }

    res.status(201).json({
        status: 201,
        message: "Created",
        data: createdWebhook.value,
    });
});

export default router;
