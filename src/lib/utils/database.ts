import { container } from "@sapphire/pieces";
import { drizzle } from "drizzle-orm/node-sqlite";
import { envParseString } from "@skyra/env-utilities";
import type { Logger } from "drizzle-orm/logger";
import { queriesRan } from "../metrics.ts";

const databaseUrl = envParseString("DATABASE_URL");

class TrackingLogger implements Logger {
  logQuery(query: string, _: unknown[]): void {
    if (container.client.dev) {
      container.logger.debug(`${query}`);
    }

    queriesRan.inc({ type: query.split(" ")?.[0] ?? "unknown" });
  }
}

export default function connect() {
  const db = drizzle(databaseUrl, { logger: new TrackingLogger() });

  container.database = db;
}
