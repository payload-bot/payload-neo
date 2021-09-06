import type { Request, Response, NextFunction } from "express";

const ALLOWED_HOSTS = [
  "https://payload.tf/",
  "https://staging.payload.tf/",
  "https://vercel.app/",
];

export const cookieName = "redirect-url";

export default function setClientUrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (ALLOWED_HOSTS.includes(req.headers.referer as string)) {
    res.cookie(cookieName, (req.headers.referer as string).slice(0, -1));
  }

  next();
}
