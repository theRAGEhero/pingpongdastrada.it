import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index";
import { ensureBaseData } from "./seed";
import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { users } from "./schema";

migrate(db, { migrationsFolder: "./drizzle" });
await ensureBaseData();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 12) {
  throw new Error("Imposta ADMIN_EMAIL e ADMIN_PASSWORD (almeno 12 caratteri).");
}
const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
if (existing) {
  console.log("Amministratore già presente; nessuna modifica effettuata.");
} else {
  await db.insert(users).values({ id: randomUUID(), name: "Amministrazione", email, passwordHash: await hash(password, 12), role: "admin" });
  console.log(`Amministratore creato per ${email}.`);
}
