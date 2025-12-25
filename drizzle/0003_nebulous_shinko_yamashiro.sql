ALTER TABLE `tasks` ADD `is_recurring` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `recurring_pattern` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `recurring_interval` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `recurring_end_date` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `recurring_days_of_week` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `recurring_day_of_month` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `parent_recurring_task_id` integer;