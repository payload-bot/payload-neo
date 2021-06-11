import express, { Request, Response } from "express";
import client from "../../..";
import checkAuth from "../../middleware/checkAuth";
import UserService from "../../services/UserService";

const router = express.Router();

const userService = new UserService();

router.use(checkAuth);

router.get("/", async (req: Request, res: Response) => {
	const user = req.user;

	const { username, tag, discriminator, avatar } = await client.users.fetch(user.id);

	const { id, notificationsLevel, latestUpdateNotifcation, steamID } =
		await userService.getUserByDiscordId(user.id);

	res.json({
		isAdmin: user.isAdmin,
		username: tag,
		name: username,
		avatar: avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${avatar}.png` : null,
		id,
		discriminator,
		notificationsLevel,
		latestUpdateNotifcation,
		steamID
	});
});

export default router;
