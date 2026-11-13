import { container } from "@sapphire/pieces";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/sqlite3";
import { envParseString } from "@skyra/env-utilities";
import { Logger } from "drizzle-orm/logger";
import { queriesRan } from "../metrics.ts";

const databaseUrl = envParseString("DATABASE_URL");

class TrackingLogger implements Logger {
  logQuery(query: string, _: unknown[]): void {
    queriesRan.inc({ type: query.split(" ")?.[0] ?? "unknown" });
  }
}

export default function connect() {
  const client = createClient({ url: databaseUrl });

  const db = drizzle(client, { logger: new TrackingLogger() });

  container.database = db;
}
