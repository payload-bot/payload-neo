import { model, Document, Schema } from "mongoose";

export type RefreshTokenModel = Document & {
	value: string;
	createdAt: Date;
};

const RefreshTokenSchema = new Schema({
	value: {
		type: String,
		required: true,
		index: true
	},

	createdAt: {
		type: Date,
		expires: '1w',
		default: Date.now
	}
});

export const RefreshToken = model("RefreshToken", RefreshTokenSchema);
