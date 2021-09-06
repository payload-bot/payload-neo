import mongoose, { Schema, version } from "mongoose";
import NotificationLevel from "../utils/notificationLevel";

export type UserModel = mongoose.Document & {
	[key: string]: any;

	id?: string;

	steamId?: string;

	webhook?: string;

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
		default: null
	},

	notificationsLevel: {
		type: Number,
		default: NotificationLevel.NONE
	},

	webhook: {
        ref: "Webhook",
        type: Schema.Types.ObjectId
    },

	latestUpdateNotifcation: {
		type: String,
		default: version
	},

	fun: {
		payload: {
			feetPushed: Number,
			pushing: Boolean,
			lastPushed: Number,
			pushedToday: Number,
			lastActiveDate: Number
		}
	},

	accessToken: String,
	refreshToken: String
});

export const User = mongoose.model<UserModel>("User", userSchema);
