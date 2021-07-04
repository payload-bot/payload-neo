import mongoose, { Schema } from "mongoose";
import { ICommandRestrictions } from "../manager/ServerManager";

export type ServerModel = mongoose.Document & {
    id: string,
    prefix?: string,
    language?: string,

    enableSnipeForEveryone?: boolean,

    commandRestrictions?: ICommandRestrictions[],

    webhook?: String;

    fun?: {
        payloadFeetPushed: number,
        payloadBeingDefended: boolean,
        payloadDefendTimeout: number
    }
};

const serverSchema = new mongoose.Schema({
    id: String,
    prefix: String,
    language: String,

    enableSnipeForEveryone: Boolean,

    webhook: {
        ref: "Webhook",
        type: Schema.Types.ObjectId
    },

    commandRestrictions: [{
        channelID: String,
        commands: [String]
    }],

    fun: {
        payloadFeetPushed: Number,
        payloadBeingDefended: Boolean,
        payloadDefendTimeout: Number
    },
});

export const Server = mongoose.model<ServerModel>("Server", serverSchema);