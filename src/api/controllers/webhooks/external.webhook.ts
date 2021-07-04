import { Router, Request, Response } from "express";
import client from "../../..";

const router = Router();

router.get("/tf2", (req: Request, res: Response) => {
	// There's a TF2 update!!!
	// Placeholder for now
	client.logger.info('TF2 Update.');
    res.status(200).send();
});

export default router;
