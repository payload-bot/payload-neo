import config from "#root/config.ts";
import { guild } from "#root/drizzle/schema.ts";
import { container, LogLevel } from "@sapphire/framework";
import type { ServerOptions } from "@sapphire/plugin-api";
import type {
  InternationalizationContext,
  InternationalizationOptions,
} from "@sapphire/plugin-i18next";
import { DurationFormatter, Time } from "@sapphire/time-utilities";
import { envParseInteger, envParseString } from "@skyra/env-utilities";
import {
  ActivityType,
  type ClientOptions,
  GatewayIntentBits,
  Options,
  Partials,
  type PresenceData,
} from "discord.js";
import { eq } from "drizzle-orm";
import { join } from "node:path";

function makeLogger() {
  return {
    level: process.env.NODE_ENV === "production"
      ? LogLevel.Info
      : LogLevel.Debug,
  };
}

function getPresence(): PresenceData {
  return {
    activities: [
      {
        name: `payload.tf`,
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
    defaultLanguageDirectory: join(Deno.cwd(), "src", "languages"),
    fetchLanguage: async (msg: InternationalizationContext) => {
      if (msg.guild) {
        const [data] = await container.database
          .select({ language: guild.language })
          .from(guild)
          .where(eq(guild.id, msg.guild.id));

        return data?.language ?? "en-US";
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
      overloadTranslationOptionHandler: (args) => ({
        defaultValue: args[1] ?? "globals:default",
      }),
    }),
    hmr: {
      enabled: process.env.NODE_ENV === "development",
    },
  };
}

function parseAPI(): ServerOptions {
  return {
    prefix: "/api/",
    listenOptions: {
      host: envParseString("HOST", "0.0.0.0"),
      port: envParseInteger("PORT", 3000),
    },
  };
}

export const CLIENT_OPTIONS: ClientOptions = {
  baseUserDirectory: "src/",
  caseInsensitivePrefixes: true,
  caseInsensitiveCommands: false,
  loadMessageCommandListeners: true,
  enableLoaderTraceLoggings: true,
  loadSubcommandErrorListeners: true,
  loadDefaultErrorListeners: true,
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
  presence: getPresence(),
  i18n: parseI18N(),
  api: parseAPI(),
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    ReactionManager: {
      maxSize: 10,
    },
    GuildMemberManager: {
      maxSize: 25,
      keepOverLimit: (member) => member.id === member.client.user.id,
    },
    GuildMessageManager: {
      maxSize: 150,
    },
    MessageManager: {
      maxSize: 250,
    },
  }),
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: {
      interval: Time.Hour,
      lifetime: Time.Minute * 15,
    },
    users: {
      interval: Time.Hour,
      filter: () => (user) => user.bot && user.id !== user.client.user.id,
    },
  },
  hmr: {
    enabled: process.env.NODE_ENV === "development",
  },
};
