import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { connection?: Database.Database };

export function databasePath() {
  return process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "pingpong.db");
}

const file = databasePath();
if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
const connection = globalForDb.connection ?? new Database(file, { timeout: 5000 });
connection.pragma("busy_timeout = 5000");
connection.pragma("foreign_keys = ON");
connection.pragma("journal_mode = WAL");
if (process.env.NODE_ENV !== "production") globalForDb.connection = connection;

export const db = drizzle(connection, { schema });
export { connection };
