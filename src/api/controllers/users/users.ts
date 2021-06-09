import express, { Request, Response } from "express";
import { User } from "../../../lib/model/User";
import { AuthedRequest } from "../../../lib/types/DiscordAuth";
import checkAuth from "../../middleware/checkAuth";

const router = express.Router();

router.use(checkAuth);

router.get("/", async (req: Request, res: Response) => {
	const user = req.user as AuthedRequest;

	const dbUser = await User.find({ id: user.id });

	res.json(dbUser);
});

export default router;
