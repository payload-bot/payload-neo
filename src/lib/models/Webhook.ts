import { model, Document, Schema } from "mongoose";

export type WebhookModel = Document & {
  value: string;
  createdAt: Date;
  type: "users" | "channels";
  id: string;
};

const WebhookSchema = new Schema({
  value: {
    type: String,
    required: true,
    index: true,
  },

  type: String,
  id: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Webhook = model<WebhookModel>("Webhook", WebhookSchema);
