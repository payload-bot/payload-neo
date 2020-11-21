import express, { Request, Response } from "express";
import { AuthedRequest } from "../../../../lib/types/DiscordAuth";
import checkAuth from "../../../middleware/checkAuth";
import getAuthedGuilds, { getAllGuilds } from "../../../helpers/getGuilds";
import checkAdmin from "../../../middleware/checkAdmin";

const router = express.Router();

router.use(checkAuth);

router.get("/all", checkAdmin, async (req: Request, res: Response) => {
	const user = req.user as AuthedRequest;

	const token = user.token;

	const guilds = await getAllGuilds(token);

	res.json(guilds);
});

router.get("/", async (req: Request, res: Response) => {
	const user = req.user as AuthedRequest;

	const token = user.token;

	const guilds = await getAuthedGuilds(token);

	res.json(guilds);
});

export default router;
