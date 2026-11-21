import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tournaments, venues } from "@/lib/db/schema";
import { formatDateTime, formatLabels, tournamentStatus } from "@/lib/utils";
import { CreateTournamentForm } from "@/components/admin/tournament-forms";
import { DemoBadge } from "@/components/ui";

export const dynamic = "force-dynamic";
export default async function AdminTournamentsPage() {
  const [allTournaments, allVenues] = await Promise.all([db.query.tournaments.findMany({ with: { venue: true, entries: true }, orderBy: [desc(tournaments.startsAt)] }), db.query.venues.findMany({ orderBy: [venues.name] })]);
  return <><div className="mb-8"><p className="eyebrow">Gestione sportiva</p><h1 className="display my-2 text-5xl">Tornei</h1><p className="muted">Crea una bozza, aggiungi partecipanti, genera gli abbinamenti e pubblica solo quando tutto è controllato.</p></div><details className="card card-solid mb-10"><summary className="cursor-pointer text-lg font-black"><Plus className="mr-2 inline" /> Nuovo torneo</summary><div className="mt-6"><CreateTournamentForm venues={allVenues} /></div></details>{allTournaments.length ? <div className="table-wrap"><table><thead><tr><th>Torneo</th><th>Data</th><th>Formato</th><th>Partecipanti</th><th>Stato</th><th /></tr></thead><tbody>{allTournaments.map((tournament) => <tr key={tournament.id}><td><strong>{tournament.name}</strong> {tournament.isDemo && <DemoBadge />}<span className="muted block text-xs">{tournament.venue?.name ?? "Luogo da definire"}</span></td><td>{formatDateTime(tournament.startsAt)}</td><td>{formatLabels[tournament.format]}</td><td>{tournament.entries.length}</td><td><span className="badge">{tournamentStatus[tournament.status]}</span></td><td><Link className="btn btn-outline btn-small" href={`/admin/tornei/${tournament.id}`}>Gestisci <ArrowUpRight size={14} /></Link></td></tr>)}</tbody></table></div> : <p className="empty-state">Nessun torneo. Apri «Nuovo torneo» per creare la prima bozza.</p>}</>;
}
