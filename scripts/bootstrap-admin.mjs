import Database from "better-sqlite3";
import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import path from "node:path";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 12) throw new Error("Imposta ADMIN_EMAIL e ADMIN_PASSWORD (almeno 12 caratteri).");
const file = process.env.DATABASE_PATH ?? path.join(process.cwd(),"data","pingpong.db");
const db = new Database(file);
const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
if (existing) console.log("Amministratore già presente; nessuna modifica effettuata.");
else {
  db.prepare("INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)").run(randomUUID(),"Amministrazione",email,await hash(password,12),"admin");
  console.log(`Amministratore creato per ${email}.`);
}
db.close();
