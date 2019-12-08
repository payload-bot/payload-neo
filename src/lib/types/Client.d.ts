import { Client, Collection } from "discord.js";
import { Command } from "../exec/Command";
import { AutoResponse } from "../types/AutoCommand";
import UserManager from "../manager/UserManager";
import ServerManager from "../manager/ServerManager";

export interface Client extends Client {
    isReady: boolean,
    commands: Collection<string, Command>,
    autoResponses: Collection<string, AutoResponse>,

    userManager: UserManager,
    serverManager: ServerManager
}