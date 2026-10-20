import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL ?? "file:./data/local.sqlite";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: url.startsWith("file:") ? "sqlite" : "postgresql",
  dbCredentials: url.startsWith("file:")
    ? { url: url.replace("file:", "") }
    : { url },
});
