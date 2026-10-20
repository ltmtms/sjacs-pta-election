import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { getEnv } from "../src/lib/env";

const SQLITE_DDL = `
CREATE TABLE IF NOT EXISTS election_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  is_open INTEGER NOT NULL DEFAULT 0,
  title_en TEXT NOT NULL DEFAULT 'SJACS PTA Parent Election',
  title_zh TEXT NOT NULL DEFAULT 'SJACS 家長教師會選舉',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK (category IN ('primary', 'secondary')),
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ballot_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  email_hash TEXT NOT NULL,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  claimed_at TEXT,
  ballot_id INTEGER
);

CREATE TABLE IF NOT EXISTS ballots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  primary_choices TEXT NOT NULL,
  secondary_choices TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const PG_DDL = `
CREATE TABLE IF NOT EXISTS election_settings (
  id SERIAL PRIMARY KEY,
  is_open BOOLEAN NOT NULL DEFAULT FALSE,
  title_en TEXT NOT NULL DEFAULT 'SJACS PTA Parent Election',
  title_zh TEXT NOT NULL DEFAULT 'SJACS 家長教師會選舉',
  updated_at TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('primary', 'secondary')),
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ballot_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  email_hash TEXT NOT NULL,
  issued_at TEXT NOT NULL DEFAULT (now()::text),
  claimed_at TEXT,
  ballot_id INTEGER
);

CREATE TABLE IF NOT EXISTS ballots (
  id SERIAL PRIMARY KEY,
  primary_choices TEXT NOT NULL,
  secondary_choices TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE IF NOT EXISTS admin_audit (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (now()::text)
);
`;

async function migratePostgres(url: string) {
  const postgres = (await import("postgres")).default;
  const sql = postgres(url, { max: 1 });
  await sql.unsafe(PG_DDL);
  const count = await sql`SELECT COUNT(*)::int AS c FROM election_settings`;
  if ((count[0]?.c ?? 0) === 0) {
    await sql`INSERT INTO election_settings (is_open) VALUES (false)`;
  }
  await sql.end();
}

function migrateSqlite(path: string) {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.exec(SQLITE_DDL);
  const row = db.prepare("SELECT COUNT(*) as c FROM election_settings").get() as {
    c: number;
  };
  if (row.c === 0) {
    db.prepare("INSERT INTO election_settings (is_open) VALUES (0)").run();
  }
  db.close();
}

async function main() {
  const env = getEnv();
  const url = env.databaseUrl;
  if (url.startsWith("postgres")) {
    await migratePostgres(url);
    console.log("PostgreSQL migrations applied");
  } else {
    const path = url.replace(/^file:/, "");
    migrateSqlite(path);
    console.log(`SQLite migrations applied at ${path}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
