import { container } from "@sapphire/pieces";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { envParseString } from "@skyra/env-utilities";

const databaseUrl = envParseString("DATABASE_PATH");

export default async function connect() {
  const sqlite = new Database(databaseUrl);
  const db = drizzle(sqlite);

  container.database = db;
}
