import type { Config } from "drizzle-kit";

export default {
  dialect: "sqlite",
  out: "./src/db",
  schema: "./src/db/schema/*",
  dbCredentials: {
    url: process.env["DATABASE_PATH"]!,
  },
  verbose: true,
} satisfies Config;
