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
        pushcartLanguage: string,
        snipePerms: Array<PermissionString>
    }

    dashboard?: {
        logs: Array<{
            action: string,
            username: string,
            date: number,
            showeddate: string,
            executor: string
        }>
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
        pushcartLanguage: String,
        snipePerms: [String]
    },

    dashboard: {
        logs: [{
            action: String,
            username: String,
            date: Number,
            showeddate: String,
            executor: String
        }]
    }
});

export const Server = mongoose.model("Server", serverSchema);