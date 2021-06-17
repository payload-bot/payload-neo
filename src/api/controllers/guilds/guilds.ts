import express, { Request, Response } from "express";
import client from "../../..";
import { ICommandRestrictions } from "../../../lib/manager/ServerManager";
import checkAuth from "../../middleware/checkAuth";
import checkBeta from "../../middleware/checkBeta";
import checkServers from "../../middleware/checkServers";
import DiscordService from "../../services/DiscordService";
import GuildService from "../../services/GuildService";
import UserService from "../../services/UserService";
import guildSettingsSchema from "../../validators/guild-settings";

const router = express.Router();

const discordService = new DiscordService();
const guildService = new GuildService();
const userService = new UserService();

router.use(checkAuth);
router.use(checkBeta);

router.get("/", async (req: Request, res: Response) => {
	const user = req.user;

	const { accessToken, refreshToken } = await userService.getUserByDiscordId(user.id);

	const guilds = await discordService.getAuthedGuilds(user.id, accessToken, refreshToken);

	res.json(guilds.map(({ server, ...guild }) => guild));
});

router.get("/:guildId", checkServers, async (req: Request, res: Response) => {
	const {
		dashboard,
		fun,
		language = "en-US",
		prefix = "pls ",
		commandRestrictions,
		settings,
		id
	} = req.guild;

	const { icon, name, channels } = client.guilds.cache.get(id) ?? (await client.guilds.fetch(id));
	const bot = client.guilds.cache.get(id).members.cache.get(client.user.id);

	res.json({
		guild: {
			channels: channels.cache.filter(c => c.type === "text").map(({ id, name }) => ({ id, name }))
		},
		commands: {
			restrictions: commandRestrictions,
			commands: client.commands.filter(c => !c.requiresRoot).map(c => c.name),
			autoResponses: client.autoResponses.map(c => c.name)
		},
		icon: icon && `https://cdn.discordapp.com/icons/${id}/${icon}.png`,
		botName: bot.nickname ?? bot.user.username,
		name,
		id,
		dashboard,
		settings,
		fun,
		language,
		prefix
	});
});

router.patch("/:guildId", checkServers, async (req: Request, res: Response) => {
	try {
		const { botName, ...values } = await guildSettingsSchema.validateAsync(req.body);

		if (botName) {
			const bot = client.guilds.cache.get(req.params.guildId).members.cache.get(client.user.id);
			bot.setNickname(botName);
		}

		if (values) {
			await guildService.findByGuildIdAndUpdate(req.params.guildId, values);
		}

		return res.status(204).send();
	} catch (err) {
		return res
			.status(400)
			.json({ status: 400, error: "Bad request", message: err.details.map(d => d.message) });
	}
});

export default router;
