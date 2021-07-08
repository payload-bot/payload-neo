import { Request, Response, NextFunction } from "express";
import client from "../..";
import { Webhook } from "../../lib/model/Webhook";

export default async function validateWebhookToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    client.logger.info(`
        Request body: ${JSON.stringify(req.body)}\n
        Request token: ${req.body.token ?? "Not present"}\n
        Request User-Agent: ${req.headers["user-agent"]}
    `);
    const token = req.body.token;

    if (!token) {
        client.logger.warn(`
        No token on requested resource. 
        Request ContentType: ${req.headers["content-type"]}
        Request User-Agent: ${req.headers["user-agent"]}
    `);
        return res.status(401).json({ code: 401, message: "No token present" });
    }

    try {
        const { id, type } = await Webhook.findOne({ value: token }).lean().orFail();
        req.webhook_type = type;
        req.webhook_id = id;
        return next();
    } catch (err) {
        return res.status(404).json({ code: 404, message: "Not found" });
    }
}
