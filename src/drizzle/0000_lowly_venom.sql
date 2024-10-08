CREATE TABLE `guild` (
	`id` text PRIMARY KEY NOT NULL,
	`prefix` text DEFAULT 'pls ' NOT NULL,
	`language` text DEFAULT 'en-US' NOT NULL,
	`legacyPushed` integer,
	`webhookId` text,
	FOREIGN KEY (`webhookId`) REFERENCES `webhook`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `pushcart` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`guildId` text NOT NULL,
	`pushed` integer NOT NULL,
	`timestamp` numeric DEFAULT (cast(strftime('%s','now') as int)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`legacyPushed` integer,
	`steamId` text,
	`webhookId` text,
	FOREIGN KEY (`webhookId`) REFERENCES `webhook`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `webhook` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`type` text NOT NULL,
	`timestamp` numeric DEFAULT (cast(strftime('%s','now') as int)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Webhook_value_key` ON `webhook` (`value`);