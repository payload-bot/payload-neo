import express, { Request, Response } from "express";
import client from "../../..";
import checkAuth from "../../middleware/checkAuth";
import checkBeta from "../../middleware/checkBeta";
import checkServers from "../../middleware/checkServers";
import DiscordService from "../../services/DiscordService";
import UserService from "../../services/UserService";

const router = express.Router();

const discordService = new DiscordService();
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
		language,
		prefix = "pls ",
		commandRestrictions,
		settings,
		id
	} = req.guild;

	const { icon, name } = client.guilds.cache.get(id) ?? (await client.guilds.fetch(id));
	const bot = client.guilds.cache.get(id).members.cache.get(client.user.id)

	res.json({
		restrictions: commandRestrictions,
		icon: icon && `https://cdn.discordapp.com/icons/${id}/${icon}.png`,
		botName: bot.user.username,
		name,
		id,
		dashboard,
		settings,
		fun,
		language,
		prefix
	});
});

export default router;
