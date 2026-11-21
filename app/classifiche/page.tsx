import type { Metadata } from "next";
import { getPublicPlayers } from "@/lib/data/public";
import { PageHero, EmptyState, DemoNotice } from "@/components/ui";
import { PlayerCard } from "@/components/player-card";

export const metadata: Metadata = { title: "Classifiche" };
export const dynamic = "force-dynamic";
type RankedPlayer = Awaited<ReturnType<typeof getPublicPlayers>>[number];
const metrics = {
  partecipazione: { label: "Partecipazione", sort: (p: RankedPlayer) => p.stats.tournaments },
  partite: { label: "Partite giocate", sort: (p: RankedPlayer) => p.stats.matches },
  vittorie: { label: "Vittorie", sort: (p: RankedPlayer) => p.stats.wins },
  percentuale: { label: "Percentuale di vittorie", sort: (p: RankedPlayer) => p.stats.matches ? p.stats.winPercentage : -1 },
};

export default async function RankingsPage({ searchParams }: { searchParams: Promise<{ metrica?: string }> }) {
  const { metrica = "partecipazione" } = await searchParams;
  const selected = metrica in metrics ? metrica as keyof typeof metrics : "partecipazione";
  const players = await getPublicPlayers();
  const sorted = [...players].sort((a,b) => metrics[selected].sort(b) - metrics[selected].sort(a) || a.displayName.localeCompare(b.displayName,"it"));
  return <>{players.some((player) => player.isDemo) && <DemoNotice />}<PageHero eyebrow="Prima la partecipazione" title="Classifiche."><p>Un modo per raccontare il percorso, non per lasciare indietro chi comincia. La vista predefinita premia la presenza; ogni numero deriva dai risultati disponibili.</p></PageHero><section className="section"><div className="container"><nav className="filters" aria-label="Metrica della classifica">{Object.entries(metrics).map(([key,metric]) => <a key={key} href={`/classifiche?metrica=${key}`} className={`btn btn-small ${selected === key ? "btn-dark" : "btn-outline"}`} aria-current={selected === key ? "page" : undefined}>{metric.label}</a>)}</nav>{sorted.length ? <div className="grid grid-4">{sorted.map((player,index) => <PlayerCard key={player.id} player={player} rank={index + 1} />)}</div> : <EmptyState title="Nessuna classifica disponibile">Servono profili pubblici facoltativi e tornei con risultati registrati. Non mostriamo classifiche basate su iscrizioni al gruppo o identità non consensuali.</EmptyState>}</div></section></>;
}
