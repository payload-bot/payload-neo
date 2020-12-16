import express, { Request, Response } from "express";
import Rcon from "srcds-rcon";

const router = express.Router();

interface IBodyResponse {
	command: string;
	ip: string;
	password: string;
}

router.post("/", async (req: Request, res: Response) => {
	const { command, ip, password } = req.body as IBodyResponse;

	if (!command) res.status(400).json({ success: false, message: "No command found." });
	if (!ip) res.status(400).json({ success: false, message: "No IP found." });
	if (!password) res.status(400).json({ success: false, message: "No password found." });

	try {
		const connection = Rcon({
			address: ip,
			password
		});

		await connection.connect();
		const response = await connection.command(command);
		await connection.disconnect();

		res.status(200).json({ success: true, message: response });
	} catch (err) {
		if (err.details && err.details.partialResponse)
			res.status(400).json({ success: false, message: err.details.partialResponse });

		res.status(500).json({ success: false, message: "Failed to connect / send command." });
	}
});

export default router;
