import { transformAuth } from "#lib/api/utils/authTransformer";
import config from "#root/config";
import { container, LogLevel } from "@sapphire/framework";
import type { ServerOptions } from "@sapphire/plugin-api";
import type { InternationalizationContext, InternationalizationOptions } from "@sapphire/plugin-i18next";
import { DurationFormatter } from "@sapphire/time-utilities";
import { envParseInteger, envParseString } from "@skyra/env-utilities";
import { ClientOptions, Intents, LimitedCollection, Options, PresenceData } from "discord.js";

function cacheOptions() {
  return Options.cacheWithLimits({
    ...Options.defaultMakeCacheSettings,
    MessageManager: {
      sweepInterval: 180,
      sweepFilter: LimitedCollection.filterByLifetime({
        lifetime: 300,
        getComparisonTimestamp: m => m.editedTimestamp ?? m.createdTimestamp,
      }),
    },
    ReactionManager: 0,
    UserManager: {
      maxSize: 7500,
      sweepInterval: 180,
    },
    GuildMemberManager: {
      maxSize: 5000,
      sweepInterval: 180,
    },
  });
}

function makeLogger() {
  return {
    level: process.env.NODE_ENV === "production" ? LogLevel.Info : LogLevel.Debug,
  };
}

function getPresence(): PresenceData {
  return {
    activities: [
      {
        name: `payload.tf/invite`,
        type: "PLAYING",
      },
    ],
  };
}

function getAllI18nFormatters() {
  return [
    {
      name: "duration",
      format: (value: any, _lng: string, options: any) => {
        return new DurationFormatter().format(value, options?.duration ?? 2);
      },
    },
  ];
}

function parseI18N(): InternationalizationOptions {
  return {
    fetchLanguage: async (msg: InternationalizationContext) => {
      if (msg.guild) {
        const server = await container.database.guild.findUnique({
          where: { id: msg.guild.id },
          select: { language: true },
        });

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
      },
      formatters: getAllI18nFormatters(),
      overloadTranslationOptionHandler: args => ({
        defaultValue: args[1] ?? "globals:default",
      }),
    }),
  };
}

function parseAPI(): ServerOptions {
  return {
    prefix: "/api/",
    automaticallyConnect: true,
    origin: "*",
    listenOptions: {
      port: envParseInteger("PORT", 8080),
    },
    auth: {
      transformers: [transformAuth],
      domainOverwrite: envParseString("COOKIE_DOMAIN"),
      id: envParseString("CLIENT_ID"),
      secret: envParseString("CLIENT_SECRET"),
      redirect: envParseString("REDIRECT_URL"),
      scopes: ["identify", "guilds"],
      cookie: "__session",
    },
  };
}

export const CLIENT_OPTIONS: ClientOptions = {
  caseInsensitivePrefixes: true,
  enableLoaderTraceLoggings: false,
  partials: ["CHANNEL"],
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
  api: parseAPI(),
  makeCache: cacheOptions(),
  presence: getPresence(),
  i18n: parseI18N(),
  hmr: {
    enabled: process.env.NODE_ENV === "development",
  },
};
