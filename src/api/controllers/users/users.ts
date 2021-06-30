import { Router, Request, Response } from "express";
import client from "../../..";
import config from "../../../config";
import checkAuth from "../../middleware/checkAuth";
import UserService from "../../services/UserService";
import userSettingsSchema from "../../validators/user-settings";

const router = Router();

const userService = new UserService();

router.use(checkAuth);

router.get("/", async (req: Request, res: Response) => {
    const user = req.user;

    const { username, tag, discriminator, avatar, defaultAvatarURL } = await client.users.fetch(
        user.id
    );

    const { id, notificationsLevel, latestUpdateNotifcation, steamID } =
        await userService.getUserByDiscordId(user.id);

    res.json({
        isAdmin: config.allowedID === user.id,
        username: tag,
        name: username,
        avatar: avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${avatar}.png`
            : defaultAvatarURL,
        id,
        discriminator,
        notificationsLevel,
        latestUpdateNotifcation,
        steamID,
    });
});

router.patch("/", async (req: Request, res: Response) => {
    try {
        const { ...values } = await userSettingsSchema.validateAsync(req.body);

        if (values) {
            await userService.findByDiscordIdAndUpdate(req.user.id, values);
        }

        return res.status(204).send();
    } catch (err) {
        return res
            .status(400)
            .json({ status: 400, error: "Bad request", message: err.details.map(d => d.message) });
    }
});

export default router;
