import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { User } from "../../../lib/model/User";
import { AuthedUser } from "../../interfaces";
require("dotenv").config();

const router = express.Router();

router.get("/", passport.authenticate("discord"));

router.get(
	"/callback",
	passport.authenticate("discord", {
		failureRedirect: `${process.env.CLIENT_URL}/login/failure?message=Failed to login`,
		failWithError: true
	}),
	async (req: Request, res: Response) => {
		const user = req.user as any as AuthedUser;

		const dbUser = await User.findOne({ id: user.profile.id });

		dbUser.accessToken = user.accessToken;
		dbUser.refreshToken = user.refreshToken;
		await dbUser.save();
		
		try {
			const token = jwt.sign(
				{
					id: user.profile.id,
					isAdmin: user.profile.isAdmin
				},
				process.env.JWT_SECRET
			);
			res.status(200).redirect(`${process.env.CLIENT_URL}/login/success?token=${token}`);
		} catch (error) {
			res.status(500).json({
				status: 500,
				error: "Internal service error",
				message: "Something went wrong with your request."
			});
		}
	}
);

export default router;
