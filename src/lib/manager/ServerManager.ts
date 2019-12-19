import * as Discord from "discord.js";
import { query } from "../../util/database";

export default class ServerManager {
    client: Discord.Client;

    constructor(client: Discord.Client) {
        this.client = client;
    }

    private async sql(guild: string, channels: Array<string>, commandsToRestrict: Array<string>) {
    }

    async getServer(guild: string) {
    }

    async addCommandRestrictions(string: any): Promise<any> {
        console.log(string);
        //await query(`INSERT INTO restrictions (guild, JSON) VALUES ('428020381413277706', '${string}')`);
    }

    async removeCommandRestrictions() {
    }
}