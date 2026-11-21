import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const cities = sqliteTable("cities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  region: text("region"),
  ...timestamps,
});

export const venues = sqliteTable("venues", {
  id: text("id").primaryKey(),
  cityId: text("city_id").notNull().references(() => cities.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address"),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  tableCount: integer("table_count"),
  indoor: integer("indoor", { mode: "boolean" }),
  access: text("access"),
  openingHours: text("opening_hours"),
  accessibility: text("accessibility"),
  verificationStatus: text("verification_status").notNull().default("unverified"),
  lastVerifiedAt: text("last_verified_at"),
  source: text("source"),
  status: text("status").notNull().default("draft"),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  cityId: text("city_id").references(() => cities.id),
  publicSlug: text("public_slug").unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  visibility: text("visibility").notNull().default("private"),
  consentAt: text("consent_at"),
  isMinor: integer("is_minor", { mode: "boolean" }).notNull().default(false),
  guardianConsentAt: text("guardian_consent_at"),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const tournaments = sqliteTable("tournaments", {
  id: text("id").primaryKey(),
  cityId: text("city_id").notNull().references(() => cities.id),
  venueId: text("venue_id").references(() => venues.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at"),
  format: text("format").notNull().default("single_elimination"),
  status: text("status").notNull().default("draft"),
  registrationStatus: text("registration_status").notNull().default("closed"),
  registrationUrl: text("registration_url"),
  maxParticipants: integer("max_participants"),
  rules: text("rules"),
  bestOf: integer("best_of").notNull().default(3),
  source: text("source"),
  dataStatus: text("data_status").notNull().default("verified"),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  publishedAt: text("published_at"),
  ...timestamps,
});

export const tournamentEntries = sqliteTable("tournament_entries", {
  id: text("id").primaryKey(),
  tournamentId: text("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  playerId: text("player_id").references(() => players.id),
  displayName: text("display_name").notNull(),
  seed: integer("seed"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  tournamentId: text("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  round: integer("round").notNull(),
  bracketPosition: integer("bracket_position").notNull(),
  homeEntryId: text("home_entry_id").references(() => tournamentEntries.id),
  awayEntryId: text("away_entry_id").references(() => tournamentEntries.id),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  scoreDetails: text("score_details"),
  status: text("status").notNull().default("scheduled"),
  winnerEntryId: text("winner_entry_id").references(() => tournamentEntries.id),
  scheduledAt: text("scheduled_at"),
  tableLabel: text("table_label"),
  ...timestamps,
}, (table) => [
  uniqueIndex("match_bracket_position_unique").on(table.tournamentId, table.round, table.bracketPosition),
]);

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  cityId: text("city_id").notNull().references(() => cities.id),
  venueId: text("venue_id").references(() => venues.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull().default("social"),
  description: text("description"),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at"),
  locationText: text("location_text"),
  registrationUrl: text("registration_url"),
  source: text("source"),
  status: text("status").notNull().default("draft"),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const milestones = sqliteTable("milestones", {
  id: text("id").primaryKey(),
  cityId: text("city_id").notNull().references(() => cities.id),
  occurredOn: text("occurred_on").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  verificationStatus: text("verification_status").notNull().default("reported"),
  source: text("source"),
  status: text("status").notNull().default("draft"),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const communityProjects = sqliteTable("community_projects", {
  id: text("id").primaryKey(),
  cityId: text("city_id").notNull().references(() => cities.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  description: text("description"),
  category: text("category").notNull().default("community"),
  fundsRaisedCents: integer("funds_raised_cents"),
  currency: text("currency").notNull().default("EUR"),
  source: text("source"),
  verificationStatus: text("verification_status").notNull().default("unverified"),
  status: text("status").notNull().default("draft"),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("editor"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const importBatches = sqliteTable("import_batches", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  targetId: text("target_id"),
  sourceName: text("source_name").notNull(),
  checksum: text("checksum").notNull(),
  status: text("status").notNull().default("review"),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const importRows = sqliteTable("import_rows", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull().references(() => importBatches.id, { onDelete: "cascade" }),
  rowNumber: integer("row_number").notNull(),
  payload: text("payload").notNull(),
  normalized: text("normalized"),
  errors: text("errors"),
  status: text("status").notNull().default("pending"),
});

export const venueSuggestions = sqliteTable("venue_suggestions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  summary: text("summary").notNull(),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  city: one(cities, { fields: [tournaments.cityId], references: [cities.id] }),
  venue: one(venues, { fields: [tournaments.venueId], references: [venues.id] }),
  entries: many(tournamentEntries),
  matches: many(matches),
}));

export const tournamentEntriesRelations = relations(tournamentEntries, ({ one }) => ({
  tournament: one(tournaments, { fields: [tournamentEntries.tournamentId], references: [tournaments.id] }),
  player: one(players, { fields: [tournamentEntries.playerId], references: [players.id] }),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  tournament: one(tournaments, { fields: [matches.tournamentId], references: [tournaments.id] }),
}));

export const venuesRelations = relations(venues, ({ one }) => ({
  city: one(cities, { fields: [venues.cityId], references: [cities.id] }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  city: one(cities, { fields: [events.cityId], references: [cities.id] }),
  venue: one(venues, { fields: [events.venueId], references: [venues.id] }),
}));

export type Tournament = typeof tournaments.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type TournamentEntry = typeof tournamentEntries.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Venue = typeof venues.$inferSelect;
export type CommunityEvent = typeof events.$inferSelect;
export type Role = "admin" | "organizer" | "editor" | "reviewer";
