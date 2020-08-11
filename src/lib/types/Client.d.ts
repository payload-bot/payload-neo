import { Client, Collection, ClientEvents, BaseClient } from "discord.js";
import { Command } from "../exec/Command";
import { AutoResponse } from "../types/AutoCommand";
import UserManager from "../manager/UserManager";
import ServerManager from "../manager/ServerManager";
import { ScheduledScript } from "./ScheduledScripts";

export interface IClientEmitter extends ClientEvents {
    "log": string
}

export interface Client extends Client {
    emit<K extends keyof IClientEmitter>(event: K, ...args: ClientEvents[K]): boolean;

    isReady: boolean,
    commands: Collection<string, Command>,
    autoResponses: Collection<string, AutoResponse>,

    scheduled: Array<ScheduledScript>,

    userManager: UserManager,
    serverManager: ServerManager,

    leaderboard: {
        users: Array<{ id: string, pushed: number }>,
        updated: Date
    },

    cache: {
        snipe: {
            [guild: string]: {
                [channel: string]: Collection<string, Message>
            }
        },

        pings: {
            [guild: string]: {
                [channel: string]: Collection<string, Message>
            }
        }
        
    }
}