import { Request, Response, NextFunction } from "express";

const STAGING_URL = "https://staging.payload.tf/";

export const cookieName = "redirect-url";

export default function setClientUrl(req: Request, res: Response, next: NextFunction) {
    if (req.headers.referer === STAGING_URL) res.cookie(cookieName, STAGING_URL.slice(0, -1));
    next();
}
