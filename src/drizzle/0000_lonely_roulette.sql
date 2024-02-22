-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `Guild` (
	`id` text PRIMARY KEY NOT NULL,
	`prefix` text DEFAULT 'pls ' NOT NULL,
	`language` text DEFAULT 'en-US' NOT NULL,
	`legacyPushed` integer,
	`webhookId` text,
	FOREIGN KEY (`webhookId`) REFERENCES `Webhook`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`legacyPushed` integer,
	`steamId` text,
	`webhookId` text,
	FOREIGN KEY (`webhookId`) REFERENCES `Webhook`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Webhook` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`type` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Pushcart` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`guildId` text NOT NULL,
	`pushed` integer NOT NULL,
	`timestamp` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Webhook_value_key` ON `Webhook` (`value`);
*/