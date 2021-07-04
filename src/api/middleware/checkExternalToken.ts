import { Request, Response, NextFunction } from "express";

export default function checkExternalToken(req: Request, res: Response, next: NextFunction) {
    const incomingToken = req.headers["x-payload-token"];
    const client = req.headers["x-payload-client"];

    switch (client) {
        // Incoming hooks for when there's a TF2 Update
        case "TF2-UPDATE": {
            const isTokenVerified = process.env.TF2SCRAPER_WEBHOOK_TOKEN === incomingToken;
            console.log(isTokenVerified);
            return isTokenVerified
                ? next()
                : res.status(403).json({ status: 403, message: "Forbidden" });
        }
        default: {
            return res.status(404).json({ status: 404, message: "Not found" });
        }
    }
}
