import mongoose from "mongoose";
import { PermissionString } from "discord.js"

export type ServerModel = mongoose.Document & {
    id?: string,
    prefix?: string,
    language?: string,

    commandRestrictions?: Array<{ channelID: string, commands: Array<string> }>,

    fun?: {
        payloadFeetPushed: number,
        payloadBeingDefended: boolean,
        payloadDefendTimeout: number
    }

    settings?: {
        dashboardPermRoles: Array<PermissionString>,
        pushcartLanguage: string
    }
};

const serverSchema = new mongoose.Schema({
    id: String,
    prefix: String,
    language: String,

    commandRestrictions: [{
        channelID: String,
        commands: [String]
    }],

    fun: {
        payloadFeetPushed: Number,
        payloadBeingDefended: Boolean,
        payloadDefendTimeout: Number
    },

    settings: {
        dashboardPermRoles: [String],
        pushcartLanguage: String
    }
});

export const Server = mongoose.model("Server", serverSchema);