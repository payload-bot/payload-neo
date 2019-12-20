import mongoose from "mongoose";

export type UserModel = mongoose.Document & {
    [key: string]: any;

    id?: string,

    fun?: {
        payload: {
            feetPushed: number,
            pushing: boolean,
            lastPushed: number,
            pushedToday: number,
            lastActiveDate: number
        }
    }
};

const userSchema = new mongoose.Schema({
    id: String,

    fun: {
        payload: {
            feetPushed: Number,
            pushing: Boolean,
            lastPushed: Number,
            pushedToday: Number,
            lastActiveDate: Number
        }
    },
});


export const User = mongoose.model("User", userSchema);