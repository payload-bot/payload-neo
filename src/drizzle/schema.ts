import { sqliteTable, text, numeric, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const guild = sqliteTable("Guild", {
  id: text("id").primaryKey().notNull(),
  prefix: text("prefix").default("pls ").notNull(),
  language: text("language").default("en-US").notNull(),
  legacyPushed: integer("legacyPushed"),
  webhookId: text("webhookId").references(() => webhook.id, { onDelete: "set null", onUpdate: "cascade" }),
});

export const user = sqliteTable("User", {
  id: text("id").primaryKey().notNull(),
  legacyPushed: integer("legacyPushed"),
  steamId: text("steamId"),
  webhookId: text("webhookId").references(() => webhook.id, { onDelete: "set null", onUpdate: "cascade" }),
});

export const webhook = sqliteTable(
  "Webhook",
  {
    id: text("id").primaryKey().notNull(),
    value: text("value").notNull(),
    type: text("type").notNull(),
    createdAt: numeric("timestamp")
      .default(sql`(cast(strftime('%s','now') as int))`)
      .notNull(),
  },
  table => {
    return {
      valueKey: uniqueIndex("Webhook_value_key").on(table.value),
    };
  },
);

export const pushcart = sqliteTable("Pushcart", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  userId: text("userId").notNull(),
  guildId: text("guildId").notNull(),
  pushed: integer("pushed").notNull(),
  timestamp: numeric("timestamp")
    .default(sql`(cast(strftime('%s','now') as int))`)
    .notNull(),
});
