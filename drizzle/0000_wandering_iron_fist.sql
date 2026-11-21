CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`summary` text NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`region` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cities_slug_unique` ON `cities` (`slug`);--> statement-breakpoint
CREATE TABLE `community_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`summary` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'community' NOT NULL,
	`funds_raised_cents` integer,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`source` text,
	`verification_status` text DEFAULT 'unverified' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `community_projects_slug_unique` ON `community_projects` (`slug`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text NOT NULL,
	`venue_id` text,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`type` text DEFAULT 'social' NOT NULL,
	`description` text,
	`starts_at` text NOT NULL,
	`ends_at` text,
	`location_text` text,
	`registration_url` text,
	`source` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE TABLE `import_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`source_name` text NOT NULL,
	`checksum` text NOT NULL,
	`status` text DEFAULT 'review' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `import_rows` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`row_number` integer NOT NULL,
	`payload` text NOT NULL,
	`normalized` text,
	`errors` text,
	`status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `import_batches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`tournament_id` text NOT NULL,
	`round` integer NOT NULL,
	`bracket_position` integer NOT NULL,
	`home_entry_id` text,
	`away_entry_id` text,
	`home_score` integer,
	`away_score` integer,
	`score_details` text,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`winner_entry_id` text,
	`scheduled_at` text,
	`table_label` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`home_entry_id`) REFERENCES `tournament_entries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`away_entry_id`) REFERENCES `tournament_entries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_entry_id`) REFERENCES `tournament_entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `match_bracket_position_unique` ON `matches` (`tournament_id`,`round`,`bracket_position`);--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text NOT NULL,
	`occurred_on` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`verification_status` text DEFAULT 'reported' NOT NULL,
	`source` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text,
	`public_slug` text,
	`display_name` text NOT NULL,
	`bio` text,
	`avatar_url` text,
	`visibility` text DEFAULT 'private' NOT NULL,
	`consent_at` text,
	`is_minor` integer DEFAULT false NOT NULL,
	`guardian_consent_at` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_public_slug_unique` ON `players` (`public_slug`);--> statement-breakpoint
CREATE TABLE `tournament_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`tournament_id` text NOT NULL,
	`player_id` text,
	`display_name` text NOT NULL,
	`seed` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text NOT NULL,
	`venue_id` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`starts_at` text NOT NULL,
	`ends_at` text,
	`format` text DEFAULT 'single_elimination' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`registration_status` text DEFAULT 'closed' NOT NULL,
	`registration_url` text,
	`max_participants` integer,
	`rules` text,
	`best_of` integer DEFAULT 3 NOT NULL,
	`source` text,
	`data_status` text DEFAULT 'verified' NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tournaments_slug_unique` ON `tournaments` (`slug`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'editor' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `venue_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`latitude` real,
	`longitude` real,
	`notes` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `venues` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`address` text,
	`description` text,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`table_count` integer,
	`indoor` integer,
	`access` text,
	`opening_hours` text,
	`accessibility` text,
	`verification_status` text DEFAULT 'unverified' NOT NULL,
	`last_verified_at` text,
	`source` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `venues_slug_unique` ON `venues` (`slug`);