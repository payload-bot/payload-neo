import mongoose from "mongoose";
import NotificationLevel from "../utils/notificationLevel";

export type UserModel = mongoose.Document & {
  id: string;

  steamId?: string;

  notificationsLevel?: number;
  latestUpdateNotifcation?: string;

  fun?: {
    payload: {
      feetPushed: number;
      pushing: boolean;
      lastPushed: number;
      pushedToday: number;
      lastActiveDate: number;
    };
  };

  accessToken?: string;
  refreshToken?: string;
};

const userSchema = new mongoose.Schema({
  id: String,

  steamId: {
    type: String,
    default: null,
  },

  notificationsLevel: {
    type: Number,
    default: NotificationLevel.NONE,
  },

  latestUpdateNotifcation: {
    type: String,
    // @TODO why is this hardcoded?
    default: "5.0.2",
  },

  fun: {
    payload: {
      feetPushed: Number,
      pushing: Boolean,
      lastPushed: Number,
      pushedToday: Number,
      lastActiveDate: Number,
    },
  },

  accessToken: String,
  refreshToken: String,
});

export const User = mongoose.model<UserModel>("User", userSchema);
