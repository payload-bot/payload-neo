PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Pushcart` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`guildId` text NOT NULL,
	`pushed` integer NOT NULL,
	`timestamp` numeric DEFAULT (cast(strftime('%s','now') as int) * 1000) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Pushcart`("id", "userId", "guildId", "pushed", "timestamp") SELECT "id", "userId", "guildId", "pushed", "timestamp" FROM `Pushcart`;--> statement-breakpoint
DROP TABLE `Pushcart`;--> statement-breakpoint
ALTER TABLE `__new_Pushcart` RENAME TO `Pushcart`;--> statement-breakpoint
PRAGMA foreign_keys=ON;