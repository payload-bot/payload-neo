import axios from "axios";
import express, { Request, Response } from "express";
import { RglApiError, RglApiResponse } from "./rgl-api.interface";
const router = express.Router();

/**
 * @deprecated Payload will no longer support 3rd party APIs - TBA
 */
router.get("/:id", async (req: Request, res: Response) => {
	const idParam = req.params.id;

	// this big thing does most of the hard work for us...
	// we just have to validate errors and destructure for the tf2-helper chrome extension
	// so that they don't have to update their repo (yet)
	try {
		const {
			data: { data }
		} = await axios.get<RglApiResponse>(`https://rgl.payload.tf/api/v1/profiles/${idParam}`);

		return res.json(data);
	} catch (err) {
		// the day I can typehint the trycatch is same day I become better programmer
		const error = err.response.data as RglApiError;
		return res.json(error);
	}
});

export default router;
