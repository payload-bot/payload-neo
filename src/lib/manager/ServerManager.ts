import * as Discord from "discord.js";
import { query } from "../../util/database";

export default class ServerManager {
    client: Discord.Client;

    constructor(client: Discord.Client) {
        this.client = client;
    }

    private async sql(guild: string, channels: Array<string>, commandsToRestrict: Array<string>) {
        let sql = (`INSERT INTO restrictions (guild, channel, commands) VALUES ?`);
        let commands: Array<any> = [];

        for (var i in channels) {
            for (var j in commandsToRestrict) {
                commands.push([`${guild}`, `${channels[i]}`, `${commandsToRestrict[j]}`]);
            }
        }
        console.log(commands);
        if (!commands.length) return console.log("No commands pushed.");
        //await query(sql, [commands])
    }

    async getServer(guild: string) {
        let server = await query(`SELECT * FROM restrictions WHERE guild='${guild}'`);
        if (!server.length) return [];
        return server[0].guild as string;
    }

    async getChannel(guild: string) {
        guild = await this.getServer(guild) as any;
        if (!guild) return [];

        let channel = await query(`SELECT * FROM restrictions WHERE guild='${guild}'`);

        return channel;
    }

    async addCommandRestrictions(guild: string, channels: Array<string>, commandsToRestrict: Array<string>): Promise<any> {
        let channelCheck = await this.getChannel(guild);

        if (channelCheck.length) {
            let commandArray: Array<any> = [];
            let queryArray: any[] = [];

            for (var i in channels) {
                for (var j in commandsToRestrict) {
                    commandArray.push([`${guild}`, `${channels[i]}`, `${commandsToRestrict[j]}`]);
                }
            }

            Object.keys(channelCheck).forEach((key) => {
                let result = channelCheck[key];
                queryArray.push([result.guild, result.channel, result.commands]);
            });

            console.log(commandArray);
            console.log(queryArray);

            //this.sql(guild, channels, commandArray);
        } else { }//this.sql(guild, channels, commandsToRestrict);
    }

    async removeCommandRestrictions() {
    }
}