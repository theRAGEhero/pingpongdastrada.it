import Link from "next/link";
import { ArrowUpRight, FileClock, MapPin, Trophy } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, tournaments, venueSuggestions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const [allTournaments, pendingVenues, logs] = await Promise.all([
    db.query.tournaments.findMany({ orderBy: [desc(tournaments.createdAt)] }),
    db.query.venueSuggestions.findMany({ where: eq(venueSuggestions.status, "pending") }),
    db.query.auditLogs.findMany({ orderBy: [desc(auditLogs.createdAt)], limit: 8 }),
  ]);
  return <><div className="mb-8"><p className="eyebrow">Panoramica</p><h1 className="display my-2 text-5xl">Buon lavoro, insieme.</h1><p className="muted">Gestisci solo ciò che conosci: ogni pubblicazione può essere corretta e viene tracciata.</p></div><div className="grid grid-3"><Link href="/admin/tornei" className="card card-solid card-link"><Trophy /><strong className="mt-3 block text-4xl">{allTournaments.length}</strong><span>Tornei totali</span><ArrowUpRight className="float-right" /></Link><Link href="/admin/sedi" className="card card-solid card-link"><MapPin /><strong className="mt-3 block text-4xl">{pendingVenues.length}</strong><span>Segnalazioni da verificare</span><ArrowUpRight className="float-right" /></Link><Link href="/admin/importazioni" className="card card-solid card-link"><FileClock /><strong className="mt-3 block text-4xl">CSV</strong><span>Importazioni revisionabili</span><ArrowUpRight className="float-right" /></Link></div><div className="mt-5"><a className="btn btn-outline btn-small" href="/api/admin/export">Esporta i dati per la portabilità</a></div><section className="mt-10"><h2 className="display text-3xl">Ultime attività</h2>{logs.length ? <div className="table-wrap"><table><thead><tr><th>Data</th><th>Attività</th><th>Dettaglio</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{new Date(log.createdAt).toLocaleString("it-IT")}</td><td>{log.action}</td><td>{log.summary}</td></tr>)}</tbody></table></div> : <p className="muted">Nessuna modifica registrata finora.</p>}</section></>;
}
