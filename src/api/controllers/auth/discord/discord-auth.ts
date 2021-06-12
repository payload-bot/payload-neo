import express, { Request, Response } from "express";
import passport from "passport";
import { User } from "../../../../lib/model/User";
import { AuthedUser } from "../../../interfaces";
import AuthService, { AuthContext } from "../../../services/AuthService";
require("dotenv").config();

const authService = new AuthService();

const router = express.Router();

router.get("/", passport.authenticate("discord"));

router.get(
	"/callback",
	passport.authenticate("discord", {
		failureRedirect: `${process.env.CLIENT_URL}/login/failure?message=Failed to login`,
		failWithError: true
	}),
	async (req: Request, res: Response) => {
		const {
			accessToken,
			refreshToken,
			profile: { id }
		} = req.user as any as AuthedUser;

		await User.findOneAndUpdate({ id }, { accessToken, refreshToken }, { new: true });

		try {
			const token = await authService.generateJwtToken(AuthContext.AUTH, id);
			const refreshToken = await authService.generateJwtToken(AuthContext.REFRESH, id);

			res
				.status(200)
				.redirect(
					`${process.env.CLIENT_URL}/login/success?token=${token}&refreshToken=${refreshToken}`
				);
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
