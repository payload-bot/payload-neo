import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();

/**
 * POST execute rcon command
 * @deprecated
 */
router.post("/", async (req: Request, res: Response) => {
	res
		.status(404)
		.json({ success: false, error: "This endpoint is now deprecated and should not be used." });
});

export default router;
