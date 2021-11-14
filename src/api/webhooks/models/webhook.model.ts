import { MongooseDocument } from "#api/shared/mongoose.document";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";

@Schema()
export class Webhook extends MongooseDocument {
  @Prop()
  id!: string;

  @Prop({ index: true, required: true })
  value!: string;

  @Prop()
  type!: string;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export type WebhookDocument = Webhook & Document;
export const WebhookSchema = SchemaFactory.createForClass(Webhook);
