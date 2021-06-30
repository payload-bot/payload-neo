import mongoose from "mongoose";
import { version } from "../../util/version_control"
import { NotificationLevel } from "../../util/push-notification";

export type UserModel = mongoose.Document & {
	[key: string]: any;

	id?: string;

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
		default: null
	},

	notificationsLevel: {
		type: Number,
		default: NotificationLevel.NONE
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

export const User = mongoose.model("User", userSchema);
