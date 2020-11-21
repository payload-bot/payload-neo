import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import DiscordUser from "../../../lib/types/DiscordAuth";
require("dotenv").config();

const router = express.Router();

router.get("/login", passport.authenticate("discord"));

router.get("/callback", passport.authenticate("discord"), (req: Request, res: Response) => {
	const user = req.user as DiscordUser;

	try {
		const authToken = jwt.sign(
			{
				id: user.profile.id,
				isAdmin: user.profile.isAdmin,
				token: user.access_token,
			},
			process.env.JWT_SECRET
		);
		res.cookie("token", authToken);
		res.status(200).redirect("http://localhost:3000/");
	} catch (error) {
		res.status(500).json({ message: "Internal service error." });
	}
});

router.get("/test", (req: Request, res: Response) => {
	try {
		jwt.verify(req.cookies.token, process.env.JWT_SECRET);
		res.send("OK");
	} catch (error) {
		res.send("NOT OKAY");
	}
});

export default router;
