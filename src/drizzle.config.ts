import type { Config } from "drizzle-kit";

export default {
  dialect: "sqlite",
  out: "./src/drizzle",
  schema: "./src/drizzle/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_PATH,
  },
  verbose: true,
  strict: true,
} satisfies Config;
