import mongoose from "mongoose";

export type ServerModel = mongoose.Document & {
    id?: string,

    commandRestrictions?: Array<{channelID: string, commands: Array<string>}>,
    fun?: {
        payloadFeetPushed: number,
        payloadBeingDefended: boolean,
        payloadDefendTimeout: number
    }
};

const serverSchema = new mongoose.Schema({
    id: String,

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

export const Server = mongoose.model("Server", serverSchema);