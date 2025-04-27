import { container } from "@sapphire/pieces";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/sqlite3";
import { envParseString } from "@skyra/env-utilities";

const databaseUrl = envParseString("DATABASE_URL");

export default function connect() {
  const client = createClient({ url: databaseUrl });

  const db = drizzle(client);

  container.database = db;
}
