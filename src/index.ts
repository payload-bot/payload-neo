import "reflect-metadata";

import "@skyra/editable-commands";
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-i18next/register";

import { Logger, LogLevel, SapphireClient, container } from "@sapphire/framework";
import { config as denvconfig } from "dotenv";
import config from "./config";
import { Intents, Message, Options } from "discord.js";
import { Server } from "#lib/models/Server";
import type { I18nContext } from "@sapphire/plugin-i18next";

denvconfig();

process.env.NODE_ENV ??= "development";

const client = new SapphireClient({
  defaultPrefix: config.PREFIX,
  logger: {
    instance: new Logger(LogLevel.Debug),
    level:
      process.env.NODE_ENV === "production" ? LogLevel.Warn : LogLevel.Debug,
  },
  fetchPrefix: async (msg: Message) => {
    if (msg.guildId) {
      const server = await Server.findOne({ id: msg.guildId }).lean().exec();

      return server?.prefix ?? config.PREFIX;
    }

    return [config.PREFIX, ""];
  },
  fetchLanguage: async (msg: I18nContext) => {
    if (!msg.guild) return "en-US";

    const id = container.client.guilds.resolveId(msg.guild as any);

    const server = await Server.findOne({ id }).lean().exec();

    return server?.language ?? "en-US";
  },
  makeCache: Options.cacheWithLimits({
    MessageManager: 250,
    UserManager: 50,
  }),
  intents: [
    // Need to parse DMS
    Intents.FLAGS.DIRECT_MESSAGES,

    // Regex commands
    Intents.FLAGS.GUILD_MESSAGES,

    // General guilds
    Intents.FLAGS.GUILDS,
  ],
  presence: {
    activities: [
      {
        name: `payload.tf/invite | v5.0.0`,
        type: "PLAYING",
      },
    ],
  },
});

client.login(process.env.TOKEN);
