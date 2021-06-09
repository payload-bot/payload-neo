import axios from "axios";
import DiscordStrategy from "passport-discord";
import refresh from "passport-oauth2-refresh";
import client from "../..";
import { Server } from "../../lib/model/Server";
import { AuthedUserServer } from "../../lib/types/DiscordAuth";

export default class DiscordService {
	private readonly DISCORD_API_URL = "https://discord.com/api";

	constructor() {}

	private async fetchUser(accessToken: string) {
		const { data } = await axios.get(`${this.DISCORD_API_URL}/users/@me`, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		return data;
	}

	private async fetchUserGuilds(accessToken: string) {
		const { data } = await axios.get(`${this.DISCORD_API_URL}/users/@me/guilds`, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		return data;
	}

	private async getAllGuilds(accessToken: string, refreshToken: string) {
		let guilds: AuthedUserServer[];

		try {
			guilds = await this.fetchUserGuilds(accessToken);
		} catch (err) {
			refresh.requestNewAccessToken("discord", refreshToken, async () => {
				const refreshedUser = await this.fetchUser(accessToken);
				console.log(refreshedUser);
			});
		}

		const allGuilds: AuthedUserServer[] = await Promise.all(
			guilds.map(async (guild: DiscordStrategy.GuildInfo) => {
				const isPayloadIn = client.guilds.cache.find(clientGuild => clientGuild.id === guild.id)
					? true
					: false;

				let server = null;

				if (isPayloadIn) {
					server = await Server.findOne({ id: guild.id });

					if (server === null) server = await Server.create({ id: guild.id });

					return {
						iconUrl: guild.icon && `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
						isPayloadIn: isPayloadIn,
						server,
						...guild
					};
				}
				return {
					iconUrl: guild.icon && `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
					isPayloadIn: isPayloadIn,
					...guild
				};
			})
		);

		return allGuilds;
	}

	async getAuthedGuilds(accessToken: string, refreshToken: string) {
		const allGuilds = await this.getAllGuilds(accessToken, refreshToken);

		const filteredGuilds = allGuilds.filter(
			guild =>
				client.guilds.cache.find(clientGuild => guild.id === clientGuild.id) &&
				(guild.permissions & 0x20) === 0x20
		);

		return filteredGuilds;
	}
}
