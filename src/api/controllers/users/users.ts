import express, { Request, Response } from "express";
import { User } from "../../../lib/model/User";
import { AuthedRequest } from "../../../lib/types/DiscordAuth";
import checkAuth from "../../middleware/checkAuth";
import DiscordService from "../../services/DiscordService";

const router = express.Router();

const discordService = new DiscordService();

router.use(checkAuth);

router.get("/", async (req: Request, res: Response) => {
	const user = req.user as AuthedRequest;

	const dbUser = await User.find({ id: user.id });

	res.json(dbUser);
});

router.get("/guilds", async (req: Request, res: Response) => {
	const user = req.user as AuthedRequest;

	const { accessToken, refreshToken } = await User.findOne({ id: user.id });

	const guilds = await discordService.getAuthedGuilds(accessToken, refreshToken);

	res.json(guilds.map(({ server, ...guild }) => guild));
});

export default router;
