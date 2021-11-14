import { MongooseDocument } from "#api/shared/mongoose.document";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import type { Document } from "mongoose";

@Schema()
export class Webhook extends MongooseDocument {
  @Prop()
  id!: string;

  @Prop({ index: true, required: true })
  value!: string;

  @Exclude()
  @Prop()
  type!: WebhookTargetType;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export type WebhookTargetType = "users" | "channels";

export type WebhookDocument = Webhook & Document;
export const WebhookSchema = SchemaFactory.createForClass(Webhook);
