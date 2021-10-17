import config from "#root/config";
import { Logger, LogLevel } from "@sapphire/framework";
import {
  ClientOptions,
  Intents,
  LimitedCollection,
  Options,
  PresenceData,
} from "discord.js";

function cacheOptions() {
  return Options.cacheWithLimits({
    ...Options.defaultMakeCacheSettings,
    MessageManager: {
      sweepInterval: 180,
      sweepFilter: LimitedCollection.filterByLifetime({
        lifetime: 900,
        getComparisonTimestamp: (m) => m.editedTimestamp ?? m.createdTimestamp,
      }),
    },
  });
}

function makeLogger() {
  return {
    instance: new Logger(LogLevel.Debug),
    level:
      process.env.NODE_ENV === "production" ? LogLevel.Info : LogLevel.Debug,
  };
}

function getPresence(): PresenceData {
  return {
    activities: [
      {
        name: `payload.tf/invite | v5.0.0`,
        type: "PLAYING",
      },
    ],
  };
}

export const CLIENT_OPTIONS: ClientOptions = {
  intents: [
    // Need to parse DMS
    Intents.FLAGS.DIRECT_MESSAGES,

    // Regex commands
    Intents.FLAGS.GUILD_MESSAGES,

    // General guilds
    Intents.FLAGS.GUILDS,
  ],
  defaultPrefix: config.PREFIX,
  logger: makeLogger(),
  makeCache: cacheOptions(),
  presence: getPresence(),
};
