import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthedRequest } from "../interfaces";

export default function checkAuth(req: Request, res: Response, next: NextFunction) {
	// Take out "Bearer" scheme
	const authHeader = req.headers?.authorization?.split(" ")[1] ?? '';
	if (!authHeader) return res.status(401).json({ status: 401, message: "Unauthorized" });

	try {
		const user = jwt.verify(authHeader, process.env.JWT_SECRET);
		req.user = user as AuthedRequest;
		return next();
	} catch (ex) {
		return res.status(401).json({ status: 401, message: "Unauthorized" });
	}
}
