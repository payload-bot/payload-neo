import { MongooseDocument } from "#api/shared/mongoose.document";
import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import { Document, Types } from "mongoose";

@Schema()
export class Server extends MongooseDocument {
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

  @Prop({ ref: "Webhook" })
  @Exclude({ toPlainOnly: true })
  webhook?: Types.ObjectId;

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

export type GuildDocument = Server & Document;
export const GuildSchema = SchemaFactory.createForClass(Server);
