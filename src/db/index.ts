import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getEnv } from "@/lib/env";

export type AppDatabase = ReturnType<typeof drizzleSqlite<typeof schema>>;

let _db: AppDatabase | null = null;

function isPostgres(url: string) {
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export function createDb(): AppDatabase {
  const { databaseUrl } = getEnv();
  if (isPostgres(databaseUrl)) {
    const client = postgres(databaseUrl, { max: 10 });
    return drizzlePg(client, { schema }) as unknown as AppDatabase;
  }
  const path = databaseUrl.replace(/^file:/, "");
  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzleSqlite(sqlite, { schema });
}

export function getDb(): AppDatabase {
  if (!_db) _db = createDb();
  return _db;
}

export function getSchemaTables() {
  return schema;
}
