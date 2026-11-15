import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { webhook } from "./webhook.ts";

export const guild = sqliteTable("Guild", {
  id: text("id").primaryKey().notNull(),
  prefix: text("prefix").default("pls ").notNull(),
  language: text("language").default("en-US").notNull(),
  legacyPushed: integer("legacyPushed"),
  webhookId: text("webhookId").references(() => webhook.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});
