import { Request, Response, NextFunction } from "express";

export const stateCookieName = "discord-state";

export default async function setDiscordState(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const stateFromCookie = req.cookies?.[stateCookieName];
  const stateFromDiscord = req.query.state;

  res.clearCookie(stateCookieName);

  if (!stateFromCookie) {
    return res.redirect(
      `${process.env.CLIENT_URL}/login/error?message=Bad request`
    );
  }

  if (stateFromDiscord !== stateFromCookie) {
    return res.redirect(
      `${process.env.CLIENT_URL}/login/error?message=Could not complete request`
    );
  }

  next();
}
