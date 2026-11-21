import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index";
import { ensureBaseData } from "./seed";

migrate(db, { migrationsFolder: "./drizzle" });
await ensureBaseData();
console.log("Migrazioni applicate e dati di base predisposti.");
