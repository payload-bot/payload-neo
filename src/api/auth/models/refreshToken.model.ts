import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";

export type RefreshTokenDocument = RefreshToken & Document;

@Schema()
export class RefreshToken {
  constructor() {}

  @Prop({ index: true })
  value!: string;

  @Prop({ type: Date, default: Date.now(), expires: "1w" })
  createdAt!: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
