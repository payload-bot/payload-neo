import { Request, Response, NextFunction } from "express";
import client from "../..";
import { Webhook } from "../../lib/model/Webhook";

export default async function validateWebhookToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.headers?.authorization;

    client.logger.info(`
        Request body: ${JSON.stringify(req.body)}\n
        Request token: ${token ?? "Not present"}\n
        Request User-Agent: ${req.headers["user-agent"]}
    `);

    if (!token) {
        return res.status(401).json({ status: 401, message: "No token present" });
    }

    try {
        const { id, type } = await Webhook.findOne({ value: token }).lean().orFail();
        req.webhook_type = type;
        req.webhook_id = id;
        return next();
    } catch (err) {
        return res.status(404).json({ status: 404, message: "Not found" });
    }
}
