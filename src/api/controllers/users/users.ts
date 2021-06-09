import express, { Request, Response } from "express";
import client from "../../..";
import { User } from "../../../lib/model/User";
import { AuthedRequest } from "../../../lib/types/DiscordAuth";
import checkAuth from "../../middleware/checkAuth";
import DiscordService from "../../services/DiscordService";
import UserService from "../../services/UserService";

const router = express.Router();

const discordService = new DiscordService();
const userService = new UserService();

router.use(checkAuth);

router.get("/", async (req: Request, res: Response) => {
	const user = req.user as AuthedRequest;

	const { username, tag, discriminator } = await client.users.fetch(user.id);

	const { id, notificationsLevel, latestUpdateNotifcation, steamID } =
		await userService.getUserByDiscordId(user.id);

	res.json({
		isAdmin: user.isAdmin,
		username: tag,
		name: username,
		id,
		discriminator,
		notificationsLevel,
		latestUpdateNotifcation,
		steamID
	});
});

router.get("/guilds", async (req: Request, res: Response) => {
	const user = req.user as AuthedRequest;

	const { accessToken, refreshToken } = await userService.getUserByDiscordId(user.id);

	const guilds = await discordService.getAuthedGuilds(user.id, accessToken, refreshToken);

	res.json(guilds.map(({ server, ...guild }) => guild));
});

export default router;
