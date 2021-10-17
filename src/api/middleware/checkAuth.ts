import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthedRequest } from "../interfaces";

export default function checkAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Take out "Bearer" scheme
  const authHeader = req.headers?.authorization?.split(" ")[1] ?? null;
  if (!authHeader)
    return res.status(401).json({ status: 401, message: "Unauthorized" });

  try {
    const user = jwt.verify(
      authHeader,
      process.env.JWT_SECRET as string
    ) as AuthedRequest;
    req.user = user;
    return next();
  } catch (ex) {
    return res.status(401).json({ status: 401, message: "Unauthorized" });
  }
}
