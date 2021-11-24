import { Server } from "#lib/models/Server";
import config from "#root/config";
import { Logger, LogLevel } from "@sapphire/framework";
import type {
  InternationalizationContext,
  InternationalizationOptions,
} from "@sapphire/plugin-i18next";
import { DurationFormatter } from "@sapphire/time-utilities";
import {
  ClientOptions,
  Intents,
  LimitedCollection,
  Options,
  PresenceData,
} from "discord.js";
import type { FormatFunction } from "i18next";

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
        name: `payload.tf/invite | ${process.env.npm_package_version}`,
        type: "PLAYING",
      },
    ],
  };
}

// see below
// function getAllI18nFormatters() {
//   return [
//     {
//       name: "duration",
//       format: (value, _lng, options) => {
//         return new DurationFormatter().format(value, options?.duration ?? 2);
//       },
//     },
//   ];
// }

function parseI18N(): InternationalizationOptions {
  return {
    fetchLanguage: async (msg: InternationalizationContext) => {
      if (msg.guild) {
        const server = await Server.findOne({ id: msg.guild.id }).lean();

        return server?.language ?? "en-US";
      }

      return "en-US";
    },
    i18next: (_: string[], languages: string[]) => ({
      fallbackLng: "en-US",
      preload: languages,
      supportedLngs: languages,
      load: "all",
      lng: "en-US",
      returnObjects: true,
      interpolation: {
        escapeValue: false,
        defaultVariables: {
          PUSHCART_EMOJI: "<:payload:656955124098269186>",
        },
        // @TODO: remove when https://github.com/sapphiredev/plugins/pull/167 is published
        format: (
          ...[value, format, _, options]: Parameters<FormatFunction>
        ) => {
          switch (format as string) {
            case "duration": {
              return new DurationFormatter().format(
                value,
                options?.precision ?? 2
              );
            }

            default: {
              return format as string;
            }
          }
        },
      },
      // @TODO: uncomment when https://github.com/sapphiredev/plugins/pull/167 is published
      // formatters: getAllI18nFormatters(),
      overloadTranslationOptionHandler: (args) => ({
        defaultValue: args[1] ?? "globals:default",
      }),
    }),
  };
}

export const CLIENT_OPTIONS: ClientOptions = {
  caseInsensitivePrefixes: true,
  intents: [
    // Need to parse DMS
    Intents.FLAGS.DIRECT_MESSAGES,

    // Regex commands
    Intents.FLAGS.GUILD_MESSAGES,

    // General guilds
    Intents.FLAGS.GUILDS,
  ],
  defaultPrefix: config.PREFIX,
  loadDefaultErrorListeners: false,
  logger: makeLogger(),
  makeCache: cacheOptions(),
  presence: getPresence(),
  i18n: parseI18N(),
};
