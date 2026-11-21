import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";

const file = process.env.DATABASE_PATH ?? path.join(process.cwd(),"data","pingpong.db");
fs.mkdirSync(path.dirname(file), { recursive: true });
const connection = new Database(file);
connection.pragma("foreign_keys = ON");
migrate(drizzle(connection), { migrationsFolder: path.join(process.cwd(),"drizzle") });
connection.close();
console.log("Migrazioni applicate.");
