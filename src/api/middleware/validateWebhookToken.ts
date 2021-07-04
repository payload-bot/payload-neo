import { Request, Response, NextFunction } from "express";
import { Webhook, WebhookModel } from "../../lib/model/Webhook";

export default async function validateWebhookToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.body.token;

    if (!token) {
        return res.status(401).json({ code: 401, message: "No token present" });
    }

    try {
        const { id, type }: WebhookModel = await Webhook.findOne({ value: token }).lean().orFail();
        req.webhook_type = type;
        req.webhook_id = id;
        return next();
    } catch (err) {
        return res.status(404).json({ code: 404, message: "Not found" });
    }
}
