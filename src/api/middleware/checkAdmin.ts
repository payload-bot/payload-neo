import { envParseArray } from "#utils/envParser";
import type { Request, Response, NextFunction } from "express";

export default function checkAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (envParseArray("OWNERS").includes(req.user!.id)) return next();
    return res.status(403).json({ message: "Forbidden" });
  } catch (ex) {
    return res.status(403).json({ message: "Forbidden" });
  }
}
