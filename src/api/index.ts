import express, { Request, Response } from "express";
import cors from "cors";
import passport from "passport";
import helmet from "helmet";
import createDiscordStrategy from "./createDiscordStrat";

// ROUTES
import StatRoutes from "./controllers/stats";
import UserRoutes from "./controllers/users";
import { DiscordAuthRoutes } from "./controllers/auth";

export async function listen(port: number): Promise<void> {
	const server = express();

	server.use(express.json());
	server.use(express.urlencoded({ extended: false }));
	server.set("json spaces", 1);
	server.use(
		cors({
			origin: "http://localhost:3000"
		})
	);
	server.use(helmet());
	server.use(passport.initialize());

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((obj, done) => {
		done(null, obj);
	});

	passport.use(createDiscordStrategy());

	// @TODO: not use internal/public.
	server.use("/api/internal/public/", StatRoutes);
	server.use("/api/auth/discord", DiscordAuthRoutes);
	server.use("/api/users", UserRoutes);

	server.all("*", (req: Request, res: Response) => {
		res.status(404).json({
			status: 404,
			error: "Not found",
			message: `Cannot find ${req.method} route for ${req.path}`
		});
	});

	return new Promise(resolve => {
		server.listen(port, resolve);
	});
}
