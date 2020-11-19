import express, { Request, Response } from "express";
import client from "../../../..";
import { version } from "../../../../util/version_control";

const router = express.Router();

router.get("/stats", (req: Request, res: Response) => {
	res.json({
		users: client.users.cache.size,
		servers: client.guilds.cache.size,
		uptime: client.uptime,
		version: version
	});
});

router.get("/commands", (req: Request, res: Response) => {
	res.json({
		commands: {
			count: client.commands.filter(command => !command.requiresRoot).size,
			data: client.commands.filter(command => !command.requiresRoot).array()
		},
		autoResponses: {
			count: client.autoResponses.size,
			data: client.autoResponses.array()
		}
	});
});

export default router;
