import { integer, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pushcart = sqliteTable("Pushcart", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  userId: text("userId").notNull(),
  guildId: text("guildId").notNull(),
  pushed: integer("pushed").notNull(),
  timestamp: numeric("timestamp")
    .notNull(),
});
