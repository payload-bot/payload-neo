import { Router, Request, Response } from "express";
import client from "../../..";
import checkAuth from "../../middleware/checkAuth";
import checkServers from "../../middleware/checkServers";
import DiscordService from "../../services/DiscordService";
import GuildService from "../../services/GuildService";
import UserService from "../../services/UserService";
import WebhookService from "../../services/WebhookService";
import getDiscordGuild from "../../utils/getDiscordGuild";
import guildSettingsSchema from "../../validators/guild-settings";

const router = Router();

const discordService = new DiscordService();
const guildService = new GuildService();
const userService = new UserService();
const webhookService = new WebhookService();

router.use(checkAuth);

router.get("/", async (req: Request, res: Response) => {
  const user = req.user;

  const { accessToken, refreshToken } = await userService.getUserByDiscordId(
    user.id
  );

  const guilds = await discordService.getAuthedGuilds(
    user.id,
    accessToken,
    refreshToken
  );

  res.json(guilds.map(({ server, ...guild }) => guild));
});

router.get("/:guildId", checkServers, async (req: Request, res: Response) => {
  const {
    enableSnipeForEveryone = false,
    language = "en-US",
    prefix = "pls ",
    webhook,
    fun,
    commandRestrictions,
    id,
  } = req.guild;

  const { icon, name, channels } = await getDiscordGuild(id);
  const clientGuild = await client.guilds.fetch(id);
  const botMemberInGuild = await clientGuild.members.fetch(client.user.id);

  res.json({
    guild: {
      channels: channels.cache
        .filter((c) => c.type === "GUILD_TEXT")
        .map(({ id, name }) => ({ id, name })),
    },
    commands: {
      restrictions: commandRestrictions,
      commands: client.commands
        .filter((c) => !c.requiresRoot)
        .map((c) => c.name),
      autoResponses: client.autoResponses.map((c) => c.name),
    },
    icon: icon && `https://cdn.discordapp.com/icons/${id}/${icon}.png`,
    botName: botMemberInGuild.nickname ?? botMemberInGuild.user.username,
    webhook: (await webhookService.getWebhookById(webhook)) || null,
    enableSnipeForEveryone,
    name,
    id,
    fun,
    language,
    prefix,
  });
});

router.patch("/:guildId", checkServers, async (req: Request, res: Response) => {
  try {
    const { botName, ...values } = await guildSettingsSchema.validateAsync(
      req.body
    );

    const id = req.params.guildId;

    if (botName) {
      const guild = await getDiscordGuild(id);
      const bot = await guild.members.fetch(client.user.id);
      bot.setNickname(botName);
    }

    if (values) {
      await guildService.findByGuildIdAndUpdate(id, values);
    }

    // Refresh cache, don't care if it hasn't been touched (tbh, this should just be removed (the cache) :/)
    try {
      const server = await client.serverManager.ensureServer(id);

      await server.refresh();
    } catch (err) {
      client.logger.error(
        `Tried to refresh cache of server ${id}, but failed!`
      );
      return res.status(500).json({
        status: 500,
        error: "Internal Server Error",
        message: `Error occured while saving guild settings for id ${id}`,
      });
    }

    return res.status(204).send();
  } catch (err: any) {
    return res.status(400).json({
      status: 400,
      error: "Bad request",
      message:
        err.details?.map((d) => d.message) ?? "Error occured while saving",
    });
  }
});

export default router;
