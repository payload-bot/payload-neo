import { generate } from "generate-password";
import { Webhook } from "#lib/models/Webhook";

export type WebhookContext = "users" | "channels";

export default class WebhookService {
  constructor() {}

  async createNewWebhook(type: WebhookContext, id: string) {
    return await Webhook.create({
      value: generate({
        length: 40,
        numbers: true,
        strict: true,
      }),
      type,
      id,
    });
  }

  async getWebhookById(id: string) {
    return await Webhook.findById(id).lean();;
  }
}
