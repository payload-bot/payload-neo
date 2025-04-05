import { container } from "@sapphire/pieces";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { envParseString } from "@skyra/env-utilities";
import { fileURLToPath } from "node:url";

const databaseUrl = envParseString("DATABASE_PATH");

export default async function connect() {
  const sqlite = new Database(databaseUrl);
  const db = drizzle(sqlite);

  migrate(db, {
    migrationsFolder: fileURLToPath(new URL("../../drizzle", import.meta.url)),
  });

  container.database = db;
}