CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`dirty` integer DEFAULT 1 NOT NULL,
	`ledger_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`color` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`dirty` integer DEFAULT 1 NOT NULL,
	`ledger_id` text NOT NULL,
	`month` text NOT NULL,
	`category_id` text NOT NULL,
	`amount` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_budgets_month` ON `budgets` (`month`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`dirty` integer DEFAULT 1 NOT NULL,
	`ledger_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ledger_members` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`dirty` integer DEFAULT 1 NOT NULL,
	`ledger_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ledgers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`dirty` integer DEFAULT 1 NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
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
	`to_account_id` text,
	`memo` text,
	`occurred_on` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_transactions_occurred_on` ON `transactions` (`occurred_on`);--> statement-breakpoint
CREATE INDEX `idx_transactions_category` ON `transactions` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_transactions_account` ON `transactions` (`account_id`);