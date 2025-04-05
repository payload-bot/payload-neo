import { container } from "@sapphire/pieces";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/sqlite3";
import { migrate } from "drizzle-orm/libsql/migrator";
import { envParseString } from "@skyra/env-utilities";
import { fileURLToPath } from "node:url";

const databaseUrl = envParseString("DATABASE_PATH");

export default function connect() {
  const client = createClient({ url: databaseUrl });

  const db = drizzle(client);

  migrate(db, {
    migrationsFolder: fileURLToPath(new URL("../../drizzle", import.meta.url)),
  });

  container.database = db;
}
