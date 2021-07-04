import { Request, Response, NextFunction } from "express";
import { Webhook, WebhookModel } from "../../lib/model/Webhook";
import webhookSchema from "../validators/webhook";

export default async function validateWebhookToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { token } = await webhookSchema.validateAsync(req.body);

    try {
        const { id, type }: WebhookModel = await Webhook.findOne({ value: token }).lean().orFail();
        req.webhook_type = type;
        req.webhook_id = id;
        return next();
    } catch (err) {
        return res.status(403).send({ code: 403, message: "Forbidden" });
    }
}
