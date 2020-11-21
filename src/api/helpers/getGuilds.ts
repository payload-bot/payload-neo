import got from "got";
import client from "../..";
import { Server } from "../../lib/model/Server";
import { AuthedUserServer } from "../../lib/types/DiscordAuth";
import DiscordStrategy from "passport-discord";

export async function getAllGuilds(token: string) {
	const { body } = await got.get("http://discordapp.com/api/users/@me/guilds", {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: true
	});

	const guilds = body;

	const allGuilds: AuthedUserServer[] = await Promise.all(
		guilds.map(async (guild: DiscordStrategy.GuildInfo) => {
			const isPayloadIn = client.guilds.cache.find(clientGuild => clientGuild.id === guild.id)
				? true
				: false;

			let server = null;

			if (isPayloadIn) {
				try {
					server = await Server.findOne({ id: guild.id });
				} catch (error) {
					const newServer = new Server({ id: guild.id });
					await newServer.save();

					server = newServer;
				}

				return {
					iconUrl: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
					isPayloadIn: isPayloadIn,
					db: server,
					...guild
				};
			}
			return {
				iconUrl: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
				isPayloadIn: isPayloadIn,
				...guild
			};
		})
	);

	return allGuilds;
}

export default async function getAuthedGuilds(token: string) {
	const allGuilds = await getAllGuilds(token);

	const filteredGuilds = allGuilds.filter(
		guild =>
			client.guilds.cache.find(clientGuild => guild.id === clientGuild.id) &&
			(guild.permissions & 0x20) === 0x20
	);

	return filteredGuilds;
}
