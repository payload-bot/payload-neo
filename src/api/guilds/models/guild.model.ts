import { MongooseDocument } from "#api/shared/mongoose.document";
import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";

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
