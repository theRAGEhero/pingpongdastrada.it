import type { Metadata } from "next";
import { getPublicTournaments } from "@/lib/data/public";
import { PageHero, EmptyState, DemoNotice } from "@/components/ui";
import { TournamentCard } from "@/components/tournament-card";
import { tournamentStatus } from "@/lib/utils";

export const metadata: Metadata = { title: "Tornei" };
export const dynamic = "force-dynamic";

export default async function TournamentsPage({ searchParams }: { searchParams: Promise<{ q?: string; stato?: string }> }) {
  const { q = "", stato = "" } = await searchParams;
  const all = await getPublicTournaments();
  const filtered = all.filter((tournament) => (!q || tournament.name.toLocaleLowerCase("it").includes(q.toLocaleLowerCase("it")) || tournament.venue?.name.toLocaleLowerCase("it").includes(q.toLocaleLowerCase("it"))) && (!stato || tournament.status === stato));
  return <>
    {all.some((item) => item.isDemo) && <DemoNotice />}
    <PageHero eyebrow="Sfide, gironi, nuove amicizie" title="Tornei."><p>Segui il tabellone, ritrova i risultati o scopri il prossimo appuntamento. La competizione è un gioco: la comunità viene prima.</p></PageHero>
    <section className="section"><div className="container">
      <form className="filters" role="search">
        <div className="field grow"><label htmlFor="q">Cerca</label><input className="input" id="q" name="q" defaultValue={q} placeholder="Nome del torneo o del luogo" /></div>
        <div className="field"><label htmlFor="stato">Stato</label><select className="select" id="stato" name="stato" defaultValue={stato}><option value="">Tutti gli stati</option>{Object.entries(tournamentStatus).filter(([key]) => key !== "draft").map(([key,label]) => <option value={key} key={key}>{label}</option>)}</select></div>
        <button className="btn btn-dark" type="submit">Filtra</button>
      </form>
      <p className="mb-5 text-sm font-bold" aria-live="polite">{filtered.length} {filtered.length === 1 ? "torneo trovato" : "tornei trovati"}</p>
      {filtered.length ? <div className="grid grid-3">{filtered.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)}</div> : <EmptyState title={all.length ? "Nessun risultato per questi filtri" : "L’archivio dei tornei è ancora vuoto"}>{all.length ? "Prova a cambiare ricerca o stato." : "I tornei appariranno qui dopo l’inserimento e la pubblicazione da parte degli organizzatori."}</EmptyState>}
    </div></section>
  </>;
}
