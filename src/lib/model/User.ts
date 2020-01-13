import mongoose from "mongoose";
import SteamID from "steamid";

type Steam3IDFunction = () => string | undefined;

export type Servers = Array<{name: string, address: string, rconPassword: string}>;

export type UserModel = mongoose.Document & {
    [key: string]: any;

    id?: string,

    steamID?: string,
    getSteam3ID?: Steam3IDFunction,

    notificationsLevel?: number,
    latestUpdateNotifcation?: string,

    fun?: {
        payload: {
            feetPushed: number,
            pushing: boolean,
            lastPushed: number,
            pushedToday: number,
            lastActiveDate: number
        }
    }

    logsTfApiKey?: string,

    servers?: Servers,
};

const userSchema = new mongoose.Schema({
    id: String,

    steamID: String,

    notificationsLevel: Number,
    latestUpdateNotifcation: String,

    fun: {
        payload: {
            feetPushed: Number,
            pushing: Boolean,
            lastPushed: Number,
            pushedToday: Number,
            lastActiveDate: Number
        }
    },

    logsTfApiKey: String,

    servers: [{
        name: String,
        address: String,
        rconPassword: String
    }],
});

userSchema.methods.getSteam3ID = function() {
    if (!this.steamID) return undefined;

    let steamID = new SteamID(this.steamID);

    return steamID.steam3();
};

export const User = mongoose.model("User", userSchema);