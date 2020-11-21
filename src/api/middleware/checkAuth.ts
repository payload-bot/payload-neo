import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthedRequest } from "../../lib/types/DiscordAuth";

export default function checkAuth(req: Request, res: Response, next: NextFunction) {
	if (!req.cookies.token) return res.status(401).json({ message: "Unauthorized." });

	try {
		const user = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
		req.user = user as AuthedRequest;
		return next();
	} catch (ex) {
		return res.status(400).json({ message: "Invalid token." });
	}
}
