import { transformAuth } from "#lib/api/utils/authTransformer";
import config from "#root/config";
import { container, LogLevel } from "@sapphire/framework";
import type { ServerOptions } from "@sapphire/plugin-api";
import type { InternationalizationContext, InternationalizationOptions } from "@sapphire/plugin-i18next";
import { DurationFormatter } from "@sapphire/time-utilities";
import { envParseInteger, envParseString } from "@skyra/env-utilities";
import {
  ActivityType,
  type ClientOptions,
  GatewayIntentBits,
  OAuth2Scopes,
  Partials,
  type PresenceData,
} from "discord.js";

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
        type: ActivityType.Playing,
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
      scopes: [OAuth2Scopes.Identify, OAuth2Scopes.Guilds],
      cookie: "__session",
    },
  };
}

export const CLIENT_OPTIONS: ClientOptions = {
  caseInsensitivePrefixes: true,
  caseInsensitiveCommands: false,
  loadMessageCommandListeners: true,
  enableLoaderTraceLoggings: false,
  loadSubcommandErrorListeners: false,
  loadDefaultErrorListeners: false,
  preventFailedToFetchLogForGuilds: true,
  defaultPrefix: config.PREFIX,
  partials: [Partials.Channel],
  intents: [
    // Message content
    GatewayIntentBits.MessageContent,

    // Need to parse DMS
    GatewayIntentBits.DirectMessages,

    // Regex commands
    GatewayIntentBits.GuildMessages,

    // General guilds
    GatewayIntentBits.Guilds,
  ],
  logger: makeLogger(),
  api: parseAPI(),
  presence: getPresence(),
  i18n: parseI18N(),
  hmr: {
    enabled: process.env.NODE_ENV === "development",
  },
};
