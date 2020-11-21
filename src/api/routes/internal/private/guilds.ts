import express, { Request, Response } from "express";
import got from "got";
import { AuthedRequest } from "../../../../lib/types/DiscordAuth";
import checkAuth from "../../../middleware/checkAuth";

const router = express.Router();

router.use((req, res, next) => checkAuth(req, res, next));

router.get("/", async (req: Request, res: Response) => {
	const user = req.user as AuthedRequest;

	const token = user.token;

	const { body } = await got.get("http://discordapp.com/api/users/@me/guilds", {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	res.json(body);
});

export default router;
