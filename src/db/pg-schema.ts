import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const electionSettings = pgTable("election_settings", {
  id: serial("id").primaryKey(),
  isOpen: boolean("is_open").notNull().default(false),
  titleEn: text("title_en").notNull().default("SJACS PTA Parent Election"),
  titleZh: text("title_zh").notNull().default("SJACS 家長教師會選舉"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`now()::text`),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  category: text("category", { enum: ["primary", "secondary"] }).notNull(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const ballotCodes = pgTable(
  "ballot_codes",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    emailHash: text("email_hash").notNull(),
    issuedAt: text("issued_at")
      .notNull()
      .default(sql`now()::text`),
    claimedAt: text("claimed_at"),
    ballotId: integer("ballot_id"),
  },
  (table) => [uniqueIndex("ballot_codes_code_idx").on(table.code)],
);

export const ballots = pgTable("ballots", {
  id: serial("id").primaryKey(),
  primaryChoices: text("primary_choices").notNull(),
  secondaryChoices: text("secondary_choices").notNull(),
  submittedAt: text("submitted_at")
    .notNull()
    .default(sql`now()::text`),
});

export const adminSessions = pgTable("admin_audit", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  detail: text("detail"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`now()::text`),
});
