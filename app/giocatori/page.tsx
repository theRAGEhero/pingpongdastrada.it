import type { Metadata } from "next";
import { getPublicPlayers } from "@/lib/data/public";
import { PageHero, EmptyState, DemoNotice } from "@/components/ui";
import { PlayerCard } from "@/components/player-card";

export const metadata: Metadata = { title: "Giocatori" };
export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const players = await getPublicPlayers();
  return <>{players.some((player) => player.isDemo) && <DemoNotice />}<PageHero eyebrow="Volti, pseudonimi, storie di gioco" title="Giocatori."><p>I profili sono facoltativi. Si può far parte della comunità senza comparire qui, oppure scegliere un nickname e condividere soltanto ciò che si desidera.</p></PageHero><section className="section"><div className="container">{players.length ? <div className="grid grid-4">{players.map((player) => <PlayerCard key={player.id} player={player} />)}</div> : <EmptyState title="Nessun profilo pubblico">Non pubblichiamo automaticamente i nomi dei partecipanti o dei membri del gruppo. I profili appariranno soltanto dopo una scelta esplicita e documentata.</EmptyState>}</div></section></>;
}
