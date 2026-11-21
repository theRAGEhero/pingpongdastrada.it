import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { importBatches, importRows, tournaments } from "@/lib/db/schema";
import { DiscardImportForm, PublishImportForm } from "@/components/admin/import-forms";

export const dynamic = "force-dynamic";
export default async function ImportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const batch = await db.query.importBatches.findFirst({ where: eq(importBatches.id,id) });
  if (!batch) notFound();
  const [rows, tournament] = await Promise.all([db.query.importRows.findMany({ where: eq(importRows.batchId,id), orderBy: [asc(importRows.rowNumber)] }), batch.targetId ? db.query.tournaments.findFirst({ where: eq(tournaments.id,batch.targetId) }) : null]);
  return <><Link href="/admin/importazioni" className="inline-flex items-center gap-2 font-bold"><ArrowLeft size={16} /> Importazioni</Link><div className="my-8"><p className="eyebrow">Revisione manuale · stato {batch.status}</p><h1 className="display my-2 text-4xl">{batch.sourceName}</h1><p className="muted">Destinazione: {tournament?.name ?? "non disponibile"} · checksum SHA-256 <code className="break-all text-xs">{batch.checksum}</code></p></div><div className="mb-6 flex flex-wrap gap-3">{batch.status === "review" && <><PublishImportForm batchId={id} /><DiscardImportForm batchId={id} /></>}</div><div className="table-wrap"><table><thead><tr><th>Riga</th><th>Esito</th><th>Nome operativo</th><th>Testa di serie</th><th>Slug collegato</th><th>Errori</th></tr></thead><tbody>{rows.map((row) => { const data = row.normalized ? JSON.parse(row.normalized) : JSON.parse(row.payload); const errors = JSON.parse(row.errors ?? "[]") as string[]; return <tr key={row.id}><td>{row.rowNumber}</td><td>{errors.length ? <XCircle className="text-red-800" aria-label="Errori" /> : <CheckCircle2 className="text-green-800" aria-label="Valida" />}</td><td>{data.display_name}</td><td>{data.seed || "—"}</td><td>{data.public_slug || "—"}</td><td className="whitespace-normal">{errors.join(" ") || "—"}</td></tr>; })}</tbody></table></div><p className="muted mt-4 text-sm">Questi dati restano nell’area riservata. La conferma aggiunge partecipazioni al torneo ma non rende pubblici nomi o profili.</p></>;
}
