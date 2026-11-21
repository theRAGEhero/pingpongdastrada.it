import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { importBatches, tournaments } from "@/lib/db/schema";
import { CsvUploadForm } from "@/components/admin/import-forms";

export const dynamic = "force-dynamic";
export default async function ImportsPage({ searchParams }: { searchParams: Promise<{ torneo?: string }> }) {
  const { torneo } = await searchParams;
  const [allTournaments, batches] = await Promise.all([db.query.tournaments.findMany({ with: { matches: true }, orderBy: [desc(tournaments.createdAt)] }), db.query.importBatches.findMany({ orderBy: [desc(importBatches.createdAt)] })]);
  const eligible = allTournaments.filter((tournament) => tournament.matches.length === 0);
  return <><p className="eyebrow">Dati grezzi separati dai dati pubblici</p><h1 className="display my-2 text-5xl">Importazioni CSV</h1><p className="muted max-w-3xl">Il caricamento crea soltanto una bozza di importazione. Dopo l’anteprima e il controllo degli errori, un organizzatore conferma l’aggiunta al torneo.</p><div className="split split-wide mt-8"><div className="card card-solid"><h2 className="display text-3xl">Partecipanti a un torneo</h2>{eligible.length ? <CsvUploadForm tournaments={eligible} selected={torneo} /> : <p className="empty-state">Crea prima un torneo senza tabellone.</p>}<a className="btn btn-outline btn-small mt-4" href="/templates/partecipanti.csv" download>Scarica il template CSV</a></div><aside className="card card-lime"><h3>Privacy dell’import</h3><ul className="pl-5 text-sm"><li>Non caricare export WhatsApp, messaggi, audio o numeri di telefono.</li><li>Il CSV crea partecipazioni operative, non profili pubblici.</li><li>Lo slug collega soltanto un profilo già esistente.</li><li>Checksum e fonte restano nell’audit.</li></ul></aside></div><section className="mt-10"><h2 className="display text-3xl">Storico import</h2>{batches.length ? <div className="table-wrap"><table><thead><tr><th>Data</th><th>Fonte</th><th>Tipo</th><th>Stato</th><th /></tr></thead><tbody>{batches.map((batch) => <tr key={batch.id}><td>{new Date(batch.createdAt).toLocaleString("it-IT")}</td><td>{batch.sourceName}</td><td>{batch.kind}</td><td>{batch.status}</td><td><Link className="underline" href={`/admin/importazioni/${batch.id}`}>Dettaglio</Link></td></tr>)}</tbody></table></div> : <p className="muted">Nessun file caricato.</p>}</section></>;
}
