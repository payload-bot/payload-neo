import { MongooseDocument } from "#api/shared/mongoose.document";
import NotificationLevel from "#utils/notificationLevel";
import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import type { Document } from "mongoose";

@Schema()
export class User extends MongooseDocument {
  @Prop()
  id!: string;

  @Prop()
  steamId?: string;

  @Prop({ enum: NotificationLevel })
  notificationsLevel!: NotificationLevel;

  @Exclude()
  @Prop()
  accessToken?: string;

  @Exclude()
  @Prop()
  refreshToken?: string;

  @Prop(
    raw({
      payload: {
        feetPushed: String,
        pushing: Boolean,
        lastPushed: Number,
        pushedToday: Number,
        lastActiveDate: Number,
      },
    })
  )
  fun!: UserPushcartDetails;
}

export interface UserPushcartDetails {
  payload: {
    feetPushed: string;
    pushing: boolean;
    lastPushed: number;
    pushedToday: number;
    lastActiveDate: number;
  };
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
