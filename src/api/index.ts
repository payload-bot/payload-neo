import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

// ROUTES
import StatRoutes from "./controllers/stats";

export async function listen(port: number): Promise<void> {
	const server = express();

	server.use(express.json());
	server.use(express.urlencoded({ extended: false }));
	server.set("json spaces", 1);
	server.use(cors());
	server.use(helmet());

	// @TODO: not use internal/public.
	server.use("/api/internal/public/", StatRoutes);

	server.all("*", (req: Request, res: Response) => {
		res
			.status(404)
			.json({
				status: 404,
				error: "Not found",
				message: `Cannot find ${req.method} route for ${req.path}`
			});
	});

	return new Promise(resolve => {
		server.listen(port, resolve);
	});
}
