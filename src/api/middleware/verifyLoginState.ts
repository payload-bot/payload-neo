import { Request, Response, NextFunction } from "express";

export const stateCookieName = "discord-state";

export default async function setDiscordState(req: Request, res: Response, next: NextFunction) {
    const stateFromCookie = req.cookies?.[stateCookieName];
    const stateFromDiscord = req.query.state;

    if (!stateFromCookie) {
        // Clear cookie no matter what
        res.clearCookie(stateCookieName);

        return res.redirect(`${process.env.CLIENT_URL}/login/failure?message=Bad request`);
    }

    if (stateFromDiscord !== stateFromCookie) {
        // Clear cookie no matter what
        res.clearCookie(stateCookieName);
        return res.redirect(
            `${process.env.CLIENT_URL}/login/failure?message=Could not complete request`
        );
    }

    res.clearCookie(stateCookieName);

    next();
}
