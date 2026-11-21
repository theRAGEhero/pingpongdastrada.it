import type { Metadata } from "next";
import { getCommunityStats, getPublicVenues } from "@/lib/data/public";
import { PageHero, EmptyState, DemoNotice } from "@/components/ui";
import { ParticipationChart } from "@/components/participation-chart";

export const metadata: Metadata = { title: "Statistiche" };
export const dynamic = "force-dynamic";

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ da?: string; a?: string; luogo?: string }> }) {
  const filters = await searchParams;
  const [stats, venues] = await Promise.all([getCommunityStats({ from: filters.da, to: filters.a, venueId: filters.luogo }), getPublicVenues()]);
  const metrics = [{v:stats.tournaments,l:"Tornei"},{v:stats.matches,l:"Partite giocate"},{v:stats.participations,l:"Partecipazioni"},{v:stats.uniqueParticipants,l:"Partecipanti unici nei record"}];
  return <>{stats.hasDemo && <DemoNotice />}<PageHero eyebrow="Dati aperti, copertura dichiarata" title="Statistiche."><p>Una fotografia costruita esclusivamente dai tornei pubblicati. Un dato assente non diventa zero e un’iscrizione al gruppo non equivale a una partecipazione attiva.</p></PageHero><section className="section"><div className="container">
    <form className="filters"><div className="field"><label htmlFor="da">Dal</label><input className="input" type="date" id="da" name="da" defaultValue={filters.da} /></div><div className="field"><label htmlFor="a">Al</label><input className="input" type="date" id="a" name="a" defaultValue={filters.a} /></div><div className="field"><label htmlFor="luogo">Luogo</label><select className="select" id="luogo" name="luogo" defaultValue={filters.luogo}><option value="">Tutti i luoghi</option>{venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}{venue.isDemo ? " (DEMO)" : ""}</option>)}</select></div><button className="btn btn-dark">Applica</button><a className="btn btn-outline" href="/statistiche">Azzera</a></form>
    {stats.tournaments ? <><div className="mb-8 flex flex-wrap gap-2"><a className="btn btn-outline btn-small" href="/api/public/export">Esporta tutti i dati pubblici</a></div><div className="metric-strip">{metrics.map((metric) => <div className="metric" key={metric.l}><strong className="metric-value">{metric.v}</strong><span className="metric-label">{metric.l}</span></div>)}</div><section className="mt-12"><p className="eyebrow">Andamento</p><h2 className="display text-4xl">Partecipazioni mese per mese</h2><ParticipationChart data={stats.monthly} /></section><div className="card mt-8"><h3>Come leggere questi dati</h3><p className="muted">I partecipanti unici sono deduplicati quando i record sono collegati a uno stesso profilo; le partecipazioni non collegate restano distinte. L’archivio può non coprire tutte le edizioni passate.</p><span className="badge badge-verify">{stats.hasDemo ? "Include dati DEMO" : "Dati derivati dai record pubblicati"}</span></div></> : <EmptyState title="Nessun dato nell’intervallo selezionato">Pubblica un torneo oppure modifica i filtri. Non sostituiamo i dati mancanti con stime o numeri dimostrativi.</EmptyState>}
  </div></section></>;
}
