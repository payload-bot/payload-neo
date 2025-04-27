CREATE TABLE IF NOT EXISTS `Guild` (
	`id` text PRIMARY KEY NOT NULL,
	`prefix` text DEFAULT 'pls ' NOT NULL,
	`language` text DEFAULT 'en-US' NOT NULL,
	`legacyPushed` integer,
	`webhookId` text,
	FOREIGN KEY (`webhookId`) REFERENCES `Webhook`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Pushcart` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`guildId` text NOT NULL,
	`pushed` integer NOT NULL,
	`timestamp` numeric
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `User` (
	`id` text PRIMARY KEY NOT NULL,
	`legacyPushed` integer,
	`steamId` text,
	`webhookId` text,
	FOREIGN KEY (`webhookId`) REFERENCES `Webhook`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Webhook` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`type` text NOT NULL,
	`createdAt` numeric
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `Webhook_value_key` ON `Webhook` (`value`);
