import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { webhook } from "./webhook.ts";

export const user = sqliteTable("User", {
  id: text("id").primaryKey().notNull(),
  legacyPushed: integer("legacyPushed"),
  steamId: text("steamId"),
  webhookId: text("webhookId").references(() => webhook.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});
