import { container } from "@sapphire/pieces";
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

export default async function connect() {
  const sqlite = new Database("sqlite.db");
  const db = drizzle(sqlite);

  container.database = db;
}
