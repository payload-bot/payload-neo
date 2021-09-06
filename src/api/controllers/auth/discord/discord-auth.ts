import { Router, Request, Response } from "express";
import passport from "passport";
import { nanoid } from "nanoid/async";
import type { DiscordUserDetails } from "../../../interfaces";
import verifyLoginState from "../../../middleware/verifyLoginState";
import setClientUrl, { cookieName } from "../../../middleware/setClientUrl";
import AuthService, { AuthContext } from "../../../services/AuthService";
import { User } from "#/lib/models/User";
require("dotenv").config();

/**
 * Cookie name for Discord State param
 */
export const stateCookieName = "discord-state";

const authService = new AuthService();

const router = Router();

router.get("/", setClientUrl, async (req, res, next) => {
    const state = await nanoid(16);
    res.cookie(stateCookieName, state, { httpOnly: true });
    passport.authenticate("discord", {
        state,
    })(req, res, next);
});

router.get(
    "/callback",
    passport.authenticate("discord", {
        failureRedirect: `${process.env.CLIENT_URL}/login/error?message=Failed to login`,
        failWithError: true,
    }),
    verifyLoginState,
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

            res.clearCookie(cookieName);
            res.redirect(
                `${redirectUrl}/login/success?token=${token}&refreshToken=${refreshToken}`
            );
        } catch (error) {
            res.redirect(`${process.env.CLIENT_URL}/login/failure?message=Error while logging in`);
        }
    }
);

export default router;
