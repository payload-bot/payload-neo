import { numeric, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const webhook = sqliteTable(
  "Webhook",
  {
    id: text("id").primaryKey().notNull(),
    value: text("value").notNull(),
    type: text("type").notNull(),
    createdAt: numeric("createdAt")
      .notNull(),
  },
  (table) => {
    return {
      valueKey: uniqueIndex("Webhook_value_key").on(table.value),
    };
  },
);
