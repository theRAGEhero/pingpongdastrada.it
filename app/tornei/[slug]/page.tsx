import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Download, MapPin, Trophy, Users } from "lucide-react";
import { getPublicTournament } from "@/lib/data/public";
import { calculateStandings } from "@/lib/domain/tournament";
import { formatDateTime, formatLabels, safeExternalUrl, tournamentStatus } from "@/lib/utils";
import { Bracket } from "@/components/bracket";
import { DemoBadge } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dettaglio torneo" };

export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tournament = await getPublicTournament(slug);
  if (!tournament) notFound();
  const completed = tournament.matches.filter((match) => match.status === "completed");
  const standings = calculateStandings(tournament.entries, tournament.matches);
  const finalMatch = tournament.format === "single_elimination" ? tournament.matches.find((match) => match.round === Math.max(...tournament.matches.map((item) => item.round), 0)) : null;
  const winner = standings.find((entry) => entry.entryId === finalMatch?.winnerEntryId) ?? (tournament.format === "round_robin" && completed.length === tournament.matches.length ? standings[0] : null);
  const registrationUrl = safeExternalUrl(tournament.registrationUrl);

  return <>
    <section className={`section-compact ${tournament.isDemo ? "bg-[#fff1a8]" : "bg-ball"}`}>
      <div className="container">
        <Link href="/tornei" className="mb-8 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16} /> Tutti i tornei</Link>
        <div className="flex flex-wrap gap-2"><span className="badge">{tournamentStatus[tournament.status]}</span>{tournament.isDemo && <DemoBadge />}</div>
        <h1 className="display my-5 max-w-5xl text-[clamp(3rem,8vw,7rem)] font-black uppercase">{tournament.name}</h1>
        <div className="card-meta"><span className="inline-flex items-center gap-2"><CalendarDays size={18} />{formatDateTime(tournament.startsAt)}</span>{tournament.venue && <span className="inline-flex items-center gap-2"><MapPin size={18} />{tournament.venue.name}</span>}<span>{formatLabels[tournament.format]}</span></div>
      </div>
    </section>
    <section className="section"><div className="container split split-wide">
      <div>
        {winner && <div className="card card-lime card-solid mb-8"><Trophy size={34} /><p className="eyebrow mt-4">Vincitrice o vincitore</p><h2 className="display m-0 text-4xl">{winner.displayName}</h2></div>}
        <h2 className="display text-4xl">Il torneo</h2>
        <p className="prose-large">{tournament.description ?? "Le informazioni sul torneo non sono ancora state inserite."}</p>
        <div className="my-8 grid grid-3">
          <div className="card"><Users /><strong className="mt-3 block text-3xl">{tournament.entries.length}</strong><span className="text-sm">partecipazioni registrate</span></div>
          <div className="card"><Trophy /><strong className="mt-3 block text-3xl">{completed.length}</strong><span className="text-sm">partite con risultato</span></div>
          <div className="card"><CalendarDays /><strong className="mt-3 block text-3xl">{tournament.bestOf}</strong><span className="text-sm">set al meglio di</span></div>
        </div>
        {registrationUrl && tournament.registrationStatus === "open" && <a className="btn btn-primary" href={registrationUrl} rel="noreferrer">Informazioni per iscriversi</a>}
        <section id="tabellone" className="mt-12"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Risultati</p><h2 className="display m-0 text-4xl">{tournament.format === "round_robin" ? "Il girone" : "Il tabellone"}</h2></div><a className="btn btn-outline btn-small" href={`/api/tournaments/${tournament.id}/export`}><Download size={15} /> Esporta dati pubblici</a></div><Bracket matches={tournament.matches} entries={tournament.entries} format={tournament.format} /></section>
        {standings.some((row) => row.played > 0) && <section id="classifica" className="mt-12"><h2 className="display text-4xl">Classifica</h2><p className="muted">Ordine per vittorie, differenza set e set vinti. Le partite senza risultato non entrano nel calcolo.</p><div className="table-wrap"><table><thead><tr><th>#</th><th>Giocatore</th><th>G</th><th>V</th><th>P</th><th>Diff. set</th><th>% vittorie</th></tr></thead><tbody>{standings.map((row,index) => <tr key={row.entryId}><td>{index + 1}</td><td className="font-bold">{row.displayName}</td><td>{row.played}</td><td>{row.wins}</td><td>{row.losses}</td><td>{row.difference > 0 ? "+" : ""}{row.difference}</td><td>{row.winPercentage}%</td></tr>)}</tbody></table></div></section>}
      </div>
      <aside>
        <div className="card card-solid"><p className="eyebrow">Partecipanti</p>{tournament.entries.length ? <ul className="mt-4 list-none space-y-3 p-0">{[...tournament.entries].sort((a,b) => (a.seed ?? 999) - (b.seed ?? 999)).map((entry) => <li key={entry.id} className="flex items-center justify-between gap-3 border-b border-black/10 pb-2">{entry.playerSlug ? <Link className="font-bold underline" href={`/giocatori/${entry.playerSlug}`}>{entry.displayName}</Link> : <span>{entry.displayName}</span>}{entry.seed && <span className="badge">TDS {entry.seed}</span>}</li>)}</ul> : <p className="muted">Nessun partecipante pubblicato.</p>}</div>
        <div className="card mt-4"><p className="eyebrow">Regole</p><p className="text-sm">{tournament.rules ?? `Partite al meglio di ${tournament.bestOf} set. Formato: ${formatLabels[tournament.format]}. Ulteriori regole non ancora inserite.`}</p>{tournament.source && <p className="muted mt-4 text-xs">Fonte: {tournament.source}</p>}</div>
      </aside>
    </div></section>
  </>;
}
