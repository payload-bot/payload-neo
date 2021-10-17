import { Router, Request, Response } from "express";
import AuthService from "../../services/AuthService";
require("dotenv").config();

const authService = new AuthService();

const router = Router();

router.post("/refresh", async (req: Request, res: Response) => {
    const oldRefreshToken = req.query.refresh_token as string;
    if (oldRefreshToken == undefined) {
        return res
            .status(400)
            .json({ status: 400, error: "Bad request", message: "No valid action specified" });
    }

    try {
        const { refreshToken, authToken } = await authService.refreshTokens(oldRefreshToken) as any;
        return res.status(200).json({
            status: 200,
            refreshToken,
            authToken,
        });
    } catch (err) {
        return res
            .status(400)
            .json({ status: 400, error: "Bad request", message: "Token mismatch" });
    }
});

export default router;
