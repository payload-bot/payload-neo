import { MongooseDocument } from "#api/shared/mongoose.document";
import NotificationLevel from "#utils/notificationLevel";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude, Transform } from "class-transformer";
import type { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema()
export class User extends MongooseDocument {
  @Prop()
  id!: string;

  @Prop()
  steamId?: string;

  @Prop({ enum: NotificationLevel })
  notificationsLevel!: NotificationLevel;

  @Prop({ default: "5.0.0" })
  latestUpdateNotifcation!: string;

  @Exclude()
  @Prop()
  accessToken?: string;

  @Exclude()
  @Prop()
  refreshToken?: string;

  @Transform(() => {
    return null;
  })
  fun!: UserPushcartDetails;
}

export interface UserPushcartDetails {
  feetPushed: string;
  pushing: boolean;
  lastPushed: number;
  pushedToday: number;
  lastActiveDate: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
