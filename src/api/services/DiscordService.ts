import type DiscordStrategy from "passport-discord";
import refresh from "passport-oauth2-refresh";
import DiscordOAuth2 from "discord-oauth2";
import { container } from "@sapphire/framework"
import type { AuthedUserServer } from "../interfaces";
import UserService from "./UserService";
import { Server } from "#/lib/models/Server";

const { client, logger } = container;

const userService = new UserService();
const discordOAuthService = new DiscordOAuth2();
export default class DiscordService {
    private async fetchUserGuilds(accessToken: string) {
        return await discordOAuthService.getUserGuilds(accessToken);
    }

    private async getAllGuilds(id: string, accessToken: string, refreshToken: string): Promise<AuthedUserServer[]> {
        let userGuilds: null | any[] = null;

        try {
            userGuilds = await this.fetchUserGuilds(accessToken);
        } catch (err) {
            logger.error(`Error while fetching user guilds: ${err}`);
            refresh.requestNewAccessToken(
                "discord",
                refreshToken,
                async (err, accessToken, refreshToken) => {
                    // o_O wonKy
                    if (err) {
                        logger.error(err.statusCode);
                        throw err;
                    }
                    await userService.saveTokensToUser(id, accessToken, refreshToken);
                    userGuilds = await this.fetchUserGuilds(accessToken);
                }
            );
        }

        const allGuilds: AuthedUserServer[] = await Promise.all(
            userGuilds!.map(async (guild: DiscordStrategy.GuildInfo) => {
                const isPayloadIn = await client.guilds.fetch(guild.id)

                if (isPayloadIn) {
                    const server = await Server.findOne({ id: guild.id }, {},  {upsert: true }).lean().exec();

                    return {
                        iconUrl:
                            guild.icon &&
                            `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
                        isPayloadIn: isPayloadIn,
                        server,
                        ...guild,
                    } as any;
                }
                return {
                    iconUrl:
                        guild.icon &&
                        `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
                    isPayloadIn: isPayloadIn,
                    ...guild,
                } as any;
            })
        );

        return allGuilds;
    }

    async getAuthedGuilds(id: string, accessToken: string, refreshToken: string) {
        const allGuilds = await this.getAllGuilds(id, accessToken, refreshToken);

        /*
			This returns all guilds that are:
			1) User has permissions 0x8, which is Administrator
		*/
        const filteredGuilds = allGuilds.filter(
            async guild =>
                (await client.guilds.fetch(guild.id) &&
                    (guild.permissions & 0x8) === 0x8) ||
                (guild.permissions & 0x8) === 0x8
        );

        return filteredGuilds.sort((a, b) => (b.isPayloadIn ? 1 : -1) - (a.isPayloadIn ? 1 : -1));
    }
}
