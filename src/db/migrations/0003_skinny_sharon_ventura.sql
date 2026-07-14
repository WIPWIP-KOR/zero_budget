CREATE TABLE `recurring_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`dirty` integer DEFAULT 1 NOT NULL,
	`ledger_id` text NOT NULL,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`category_id` text,
	`account_id` text,
	`memo` text,
	`frequency` text NOT NULL,
	`day_of_month` integer,
	`weekday` integer,
	`start_on` text NOT NULL,
	`end_on` text
);
--> statement-breakpoint
ALTER TABLE `goals` ADD `kind` text DEFAULT 'saving' NOT NULL;--> statement-breakpoint
ALTER TABLE `ledgers` ADD `kind` text DEFAULT 'main' NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `status` text DEFAULT 'sorted' NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `photo_url` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `video_url` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `raw_comment` text;--> statement-breakpoint
CREATE INDEX `idx_transactions_status` ON `transactions` (`status`);