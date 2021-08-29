import { Request, Response, NextFunction } from "express";

const ALLOWED_HOSTS = ["https://payload.tf/", "https://vercel.app"];

export const cookieName = "redirect-url";

export default function setClientUrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (ALLOWED_HOSTS.includes(req.headers.referer)) {
    res.cookie(cookieName, ALLOWED_HOSTS.indexOf(req.headers.host));
  }

  next();
}
