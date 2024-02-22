import type { Config } from "drizzle-kit";
import { resolve } from "node:path";

export default {
  driver: "better-sqlite",
  out: "./src/drizzle",
  schema: [resolve(__dirname, "./src/drizzle/schema.ts")],
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;
