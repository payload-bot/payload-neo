import { Server } from "#lib/models/Server";
import config from "#root/config";
import { Logger, LogLevel } from "@sapphire/framework";
import type { InternationalizationContext, InternationalizationOptions } from "@sapphire/plugin-i18next";
import { DurationFormatter } from "@sapphire/time-utilities";
import {
  ClientOptions,
  Intents,
  LimitedCollection,
  Options,
  PresenceData,
} from "discord.js";
import type { FormatFunction } from 'i18next';
import { getRootData } from '@sapphire/pieces';

// @ts-ignore
import { resolve } from "path";
// @ts-ignore
const ROOT = getRootData().root;

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

// @ts-ignore
function parseI18N(): InternationalizationOptions {
  return {
    fetchLanguage: async (msg: InternationalizationContext) => {
      if (msg.guild) {
        const server = await Server.findOne({ id: msg.guild.id }).lean()
  
        return server?.language ?? "en-US";
      }
  
      return "en-US";
    },
    i18next: (_: string[], languages: string[]) => ({
      fallbackLng: "en-US",
      preload: languages,
      supportedLngs: languages,
      debug: true,
      load: 'all',
      lng: "en-US",
      interpolation: {
        format: (...[value, format, _, options]: Parameters<FormatFunction>) => {
          switch (format as string) {
            case "duration": {
              return new DurationFormatter().format(value, options?.precision ?? 2)
            }

            default: {
              return format as string;
            }
          }
        }
      },
      overloadTranslationOptionHandler: (args) => ({ defaultValue: args[1] ?? 'globals:default' }),
    })
  }
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
  i18n: parseI18N(),
};
