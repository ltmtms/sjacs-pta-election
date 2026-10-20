import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const electionSettings = sqliteTable("election_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  isOpen: integer("is_open", { mode: "boolean" }).notNull().default(false),
  titleEn: text("title_en").notNull().default("SJACS PTA Parent Election"),
  titleZh: text("title_zh").notNull().default("SJACS 家長教師會選舉"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const candidates = sqliteTable("candidates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category", { enum: ["primary", "secondary"] }).notNull(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

/** Issued ballot codes — no FK from ballots back to this table. */
export const ballotCodes = sqliteTable(
  "ballot_codes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull(),
    emailHash: text("email_hash").notNull(),
    issuedAt: text("issued_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    claimedAt: text("claimed_at"),
    /** Set when code is claimed; ballots table has no reverse FK. */
    ballotId: integer("ballot_id"),
  },
  (table) => [uniqueIndex("ballot_codes_code_idx").on(table.code)],
);

/** Anonymous ballot — no voter code or email columns. */
export const ballots = sqliteTable("ballots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  primaryChoices: text("primary_choices").notNull(),
  secondaryChoices: text("secondary_choices").notNull(),
  submittedAt: text("submitted_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const adminSessions = sqliteTable("admin_audit", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  action: text("action").notNull(),
  detail: text("detail"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
