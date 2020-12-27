import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();

/**
 * POST execute rcon command
 * @deprecated
 */
router.post("/", async (req: Request, res: Response) => {
	try {
		const { data } = await axios.post("https://rcon.tf/api/execute", req.body);
		res.json({ success: true, body: data });
	} catch (err) {
		console.log(err.toString());
		res.status(err.statusCode).json({ success: false, error: err.toString() });
	}
});

export default router;
