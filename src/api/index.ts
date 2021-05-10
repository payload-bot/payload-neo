import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

// ROUTES
import InternalRoutes from "./routes/internal/internal-handler";

export async function listen(port: number): Promise<void> {
	const server = express();

	server.use(express.json());
	server.use(express.urlencoded({ extended: false }));
	server.set("json spaces", 1);
	server.use(cors());
	server.use(helmet());

	server.use("/internal/", InternalRoutes);

	server.all("*", (req: Request, res: Response) => {
		res.status(404).json({ message: `Cannot find ${req.method} route for ${req.path}` });
	});

	return new Promise(resolve => {
		server.listen(port, resolve);
	});
}
