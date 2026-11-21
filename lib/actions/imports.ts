"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, importBatches, importRows, players, tournamentEntries, tournaments } from "@/lib/db/schema";
import { checksum, parseCsv, validateParticipantRows } from "@/lib/domain/csv";
import { requireRole } from "@/lib/auth-utils";
import type { ActionState } from "./tournaments";

export async function uploadParticipantsCsvAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(["admin","organizer"]);
  const tournamentId = String(formData.get("tournamentId") ?? "");
  const sourceName = String(formData.get("sourceName") ?? "").trim();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > 1_000_000) return { error: "Seleziona un CSV non vuoto di massimo 1 MB." };
  if (sourceName.length < 3) return { error: "Indica la fonte del file (almeno 3 caratteri)." };
  const tournament = await db.query.tournaments.findFirst({ where: eq(tournaments.id,tournamentId), with: { matches: true } });
  if (!tournament || tournament.matches.length) return { error: "Torneo non valido o tabellone già generato." };
  let rows;
  try { rows = validateParticipantRows(parseCsv(await file.text())); }
  catch { return { error: "CSV non leggibile. Usa intestazioni display_name,seed,public_slug e colonne coerenti." }; }
  if (!rows.length || rows.length > 500) return { error: "Il file deve contenere da 1 a 500 partecipanti." };
  const digest = checksum(await file.text());
  const duplicate = await db.query.importBatches.findFirst({ where: eq(importBatches.checksum,digest) });
  if (duplicate) return { error: "Questo identico file è già stato importato." };
  const batchId = randomUUID();
  db.transaction((tx) => {
    tx.insert(importBatches).values({ id: batchId, kind: "participants", targetId: tournamentId, sourceName, checksum: digest, createdBy: user.id }).run();
    for (const item of rows) {
      tx.insert(importRows).values({ id: randomUUID(), batchId, rowNumber: item.rowNumber, payload: JSON.stringify(item.row), normalized: item.normalized ? JSON.stringify(item.normalized) : null, errors: JSON.stringify(item.errors), status: item.errors.length ? "invalid" : "pending" }).run();
    }
    tx.insert(auditLogs).values({ id: randomUUID(), actorId: user.id, action: "import.staged", entityType: "import", entityId: batchId, summary: `${rows.length} righe CSV in revisione per ${tournament.name}` }).run();
  });
  revalidatePath("/admin/importazioni");
  redirect(`/admin/importazioni/${batchId}`);
}

export async function publishParticipantsImportAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(["admin","organizer"]);
  const batchId = String(formData.get("batchId") ?? "");
  const batch = await db.query.importBatches.findFirst({ where: eq(importBatches.id,batchId), with: undefined });
  if (!batch || batch.kind !== "participants" || batch.status !== "review" || !batch.targetId) return { error: "Importazione non disponibile." };
  const [rows, tournament] = await Promise.all([db.query.importRows.findMany({ where: eq(importRows.batchId,batchId) }), db.query.tournaments.findFirst({ where: eq(tournaments.id,batch.targetId), with: { matches: true, entries: true } })]);
  if (!tournament || tournament.matches.length) return { error: "Il torneo è cambiato: importazione annullata." };
  if (rows.some((row) => row.status === "invalid" || !row.normalized)) return { error: "Correggi nel CSV tutte le righe segnalate e carica una nuova versione." };
  const existingNames = new Set(tournament.entries.map((entry) => entry.displayName.toLocaleLowerCase("it")));
  const normalizedRows = rows.map((row) => JSON.parse(row.normalized!) as { display_name: string; seed?: number | ""; public_slug?: string | "" });
  if (normalizedRows.some((row) => existingNames.has(row.display_name.toLocaleLowerCase("it")))) return { error: "Un partecipante è già presente nel torneo. Rimuovi il duplicato dal file." };
  const slugs = [...new Set(normalizedRows.map((row) => row.public_slug).filter(Boolean))];
  const linkedPlayers = await Promise.all(slugs.map((slug) => db.query.players.findFirst({ where: eq(players.publicSlug,String(slug)) })));
  if (linkedPlayers.some((player) => !player)) return { error: "Uno degli slug indicati non corrisponde a un profilo esistente." };
  const playerBySlug = new Map(linkedPlayers.filter(Boolean).map((player) => [player!.publicSlug,player!]));
  db.transaction((tx) => {
    for (const row of normalizedRows) {
      tx.insert(tournamentEntries).values({ id: randomUUID(), tournamentId: tournament.id, displayName: row.display_name, seed: row.seed === "" || row.seed === undefined ? null : row.seed, playerId: row.public_slug ? playerBySlug.get(row.public_slug)?.id : null }).run();
    }
    tx.update(importBatches).set({ status: "imported" }).where(eq(importBatches.id,batchId)).run();
    tx.update(importRows).set({ status: "accepted" }).where(eq(importRows.batchId,batchId)).run();
    tx.insert(auditLogs).values({ id: randomUUID(), actorId: user.id, action: "import.published", entityType: "import", entityId: batchId, summary: `${rows.length} partecipanti importati in ${tournament.name}` }).run();
  });
  revalidatePath(`/admin/tornei/${tournament.id}`); revalidatePath("/admin/importazioni");
  return { success: `${rows.length} partecipanti aggiunti al torneo. Nessun profilo pubblico è stato creato.` };
}

export async function discardImportAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(["admin","organizer","reviewer"]);
  const batchId = String(formData.get("batchId") ?? "");
  await db.update(importBatches).set({ status: "discarded" }).where(and(eq(importBatches.id,batchId),eq(importBatches.status,"review")));
  await db.insert(auditLogs).values({ id: randomUUID(), actorId: user.id, action: "import.discarded", entityType: "import", entityId: batchId, summary: "Importazione scartata" });
  revalidatePath("/admin/importazioni"); return { success: "Importazione scartata." };
}
