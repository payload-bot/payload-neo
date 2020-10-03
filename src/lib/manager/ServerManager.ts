import { Server, ServerModel } from "../model/Server";
import * as Discord from "discord.js";
import config from "../../config";

export interface ICommandRestrictions {
    channelID: string,
    commands: Array<string>
}

export default class ServerManager {
    discordClient: Discord.Client;
    servers: Map<string, ServerEditable>;

    constructor(bot: Discord.Client) {
        this.discordClient = bot;
        this.servers = new Map();
    }

    async getServer(guildID: string) {
        return this.servers.get(guildID) || this.ensureServer(guildID);
    }

    async ensureServer(guildID: string) {
        let server: ServerModel | null;
        server = await Server.findOne({ id: guildID });

        if (!server) {
            server = new Server({
                id: guildID
            });
        }

        let serverEditable = new ServerEditable(server);
        this.servers.set(guildID, serverEditable);

        return serverEditable;
    }
}

export class ServerEditable {
    server: ServerModel;

    constructor(model: ServerModel) {
        this.server = model;
    }

    getCommandRestrictions(channelID?: string): string[] | ICommandRestrictions[] {
        this.server.commandRestrictions = this.server.commandRestrictions || [];

        if (channelID) {
            let channelRestrictions = this.server.commandRestrictions.find(restrictions => restrictions.channelID == channelID);

            if (!channelRestrictions) return [];

            return channelRestrictions.commands;
        }

        return this.server.commandRestrictions;
    }

    addCommandRestrictions(restrictions: ICommandRestrictions[]): ICommandRestrictions[] {
        this.server.commandRestrictions = this.server.commandRestrictions || [];

        // Loop through each channel to match them up.
        for (let i = 0; i < restrictions.length; i++) {
            let existing = this.server.commandRestrictions.find(val => val.channelID == restrictions[i].channelID);

            if (!existing) this.server.commandRestrictions.push(restrictions[i]);
            else {
                let commandsRaw = [...existing.commands, ...restrictions[i].commands];

                existing.commands = [...new Set(commandsRaw)];
            }
        }

        return this.server.commandRestrictions;
    }

    removeCommandRestrictions(restrictions: ICommandRestrictions[]): ICommandRestrictions[] {
        if (!this.server.commandRestrictions) return [];

        // Loop through each channel to match them up.
        for (let i = 0; i < restrictions.length; i++) {
            let existing = this.server.commandRestrictions.find(val => val.channelID == restrictions[i].channelID);

            if (existing) {
                existing.commands = existing.commands.filter(existingCommand => !restrictions[i].commands.includes(existingCommand));
            }
        }

        return this.server.commandRestrictions;
    }

    getPrefixFromGuild(guild: string) {
        return this.server.prefix || config.PREFIX;
    }

    getLanguageFromGuild(guild: string) {
        if (!this.server.language) return "en-US"
        else return this.server.language;
    }

    addCartFeet(miles: number) {
        this.server.fun = this.server.fun || {
            payloadFeetPushed: 0,
            payloadBeingDefended: false,
            payloadDefendTimeout: -1
        };

        this.server.fun.payloadFeetPushed = this.server.fun.payloadFeetPushed || 0;

        return this.server.fun.payloadFeetPushed += miles;
    }

    defendCart(time: number) {
        this.server.fun = this.server.fun || {
            payloadFeetPushed: 0,
            payloadBeingDefended: false,
            payloadDefendTimeout: -1
        };
    }

    async refresh() {
        this.server = (await Server.findOne({ id: this.server.id })) as ServerModel;

        return this;
    }

    async save() {
        return await this.server.save();
    }
}