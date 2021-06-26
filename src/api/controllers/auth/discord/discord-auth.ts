import { Router, Request, Response } from "express";
import passport from "passport";
import { User } from "../../../../lib/model/User";
import { DiscordUserDetails } from "../../../interfaces";
import setClientUrl, { cookieName } from "../../../middleware/setClientUrl";
import AuthService, { AuthContext } from "../../../services/AuthService";
require("dotenv").config();

const authService = new AuthService();

const router = Router();

router.get("/", setClientUrl, passport.authenticate("discord"));

router.get(
    "/callback",
    passport.authenticate("discord", {
        failureRedirect: `${process.env.CLIENT_URL}/login/failure?message=Failed to login`,
        failWithError: true,
    }),
    async (req: Request, res: Response) => {
        const {
            accessToken,
            refreshToken,
            profile: { id },
        } = req.user as any as DiscordUserDetails;

        await User.findOneAndUpdate({ id }, { accessToken, refreshToken });

        try {
            const token = await authService.generateJwtToken(AuthContext.AUTH, id);
            const refreshToken = await authService.generateJwtToken(AuthContext.REFRESH, id);

            const redirectUrl = req.cookies?.[cookieName] || process.env.CLIENT_URL;

            res.redirect(
                `${redirectUrl}/login/success?token=${token}&refreshToken=${refreshToken}`
            );
            res.clearCookie(cookieName);
        } catch (error) {
            res.redirect(`${process.env.CLIENT_URL}/login/failure?message=Error while logging in`);
        }
    }
);

export default router;
