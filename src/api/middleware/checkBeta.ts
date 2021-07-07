import { Request, Response, NextFunction } from "express";
import { isInPayloadDiscord } from "../utils/isBetaTester";

export default async function checkUserIsInPayloadDiscord(req: Request, res: Response, next: NextFunction) {
    return (await isInPayloadDiscord(req.user.id))
        ? next()
        : res.status(403).json({
              status: 403,
              message: "Not a beta user",
          });
}
