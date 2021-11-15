import { MongooseDocument } from "#api/shared/mongoose.document";
import { Webhook } from "#api/webhooks/models/webhook.model";
import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude, Type } from "class-transformer";
import { Document, Types } from "mongoose";

export type GuildDocument = Guild & Document;

@Schema()
export class Guild extends MongooseDocument {
  @Prop()
  id!: string;

  @Prop()
  prefix!: string;

  @Prop()
  language!: string;

  @Prop({ type: Boolean })
  enableSnipeForEveryone!: boolean;

  @Prop({ type: [String] })
  commandRestrictions!: string[];

  @Prop({ type: Types.ObjectId, ref: "Webhook" })
  @Exclude()
  @Type(() => Webhook)
  webhook?: Webhook;

  @Prop(
    raw({
      payloadFeetPushed: Number,
      payloadDefendTimeout: Number,
      payloadBeingDefended: Boolean,
    })
  )
  fun!: GuildFun;
}

export interface GuildFun {
  payloadFeetPushed: number;
  payloadDefendTimeout: number;
  payloadBeingDefended: boolean;
}

export const GuildSchema = SchemaFactory.createForClass(Guild);
