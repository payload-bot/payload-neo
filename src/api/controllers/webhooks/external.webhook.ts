import { Router, Request, Response } from "express";
import { container } from "@sapphire/framework";

const { client } = container;

const router = Router();

router.post("/tf2", (_req: Request, res: Response) => {
	// There's a TF2 update!!!
	// Placeholder for now
	client.logger.info('TF2 Update.');
    res.status(200).send();
});

export default router;
