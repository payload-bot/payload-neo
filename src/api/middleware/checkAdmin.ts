import type { Request, Response, NextFunction } from "express";
import config from "../../config";

export default function checkAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (config.allowedID!.includes(req.user!.id)) return next();
    return res.status(403).json({ message: "Forbidden" });
  } catch (ex) {
    return res.status(403).json({ message: "Forbidden" });
  }
}
