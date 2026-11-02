import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.sqlite";

// On Vercel serverless, the project root is read-only, so SQLite cannot create
// or write ./dev.sqlite. Use /tmp (writable) instead. Note: /tmp is per
// function invocation, so data won't persist across cold starts — the app
// reseeds on each load, which keeps the demo fully functional.
const isVercel = process.env.VERCEL === "1";
const dbPath = isVercel
  ? "/tmp/dev.sqlite"
  : databaseUrl.startsWith("file:") ? databaseUrl.slice(5) : databaseUrl;

type SqliteDatabase = InstanceType<typeof Database>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsSqliteDb?: SqliteDatabase;
};

export const sqlite =
  globalForDb.__arenaNextJsSqliteDb ??
  new Database(dbPath);

// WAL allows concurrent readers + the dev server hot-reload process.
sqlite.pragma("journal_mode = WAL");

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsSqliteDb = sqlite;
}

export const db = drizzle(sqlite);
