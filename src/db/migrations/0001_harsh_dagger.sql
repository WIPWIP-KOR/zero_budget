CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`dirty` integer DEFAULT 1 NOT NULL,
	`ledger_id` text NOT NULL,
	`month` text NOT NULL,
	`saving_target` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_goals_month` ON `goals` (`month`);