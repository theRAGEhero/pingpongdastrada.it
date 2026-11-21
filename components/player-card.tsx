import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DemoBadge } from "./ui";

type PlayerCardData = {
  id: string; publicSlug: string | null; displayName: string; isDemo: boolean;
  stats: { tournaments: number; matches: number; wins: number; losses: number; winPercentage: number };
};

export function PlayerCard({ player, rank }: { player: PlayerCardData; rank?: number }) {
  return <Link href={`/giocatori/${player.publicSlug}`} className="card card-solid card-link player-card">
    {rank && <span className="player-rank" aria-label={`Posizione ${rank}`}>{String(rank).padStart(2,"0")}</span>}
    <div className="player-avatar" aria-hidden="true">{player.displayName.slice(0,1)}</div>
    <div className="mt-4 flex flex-wrap gap-2">{player.isDemo && <DemoBadge />}</div>
    <h3>{player.displayName}</h3>
    <div className="player-stats"><div><strong>{player.stats.tournaments}</strong><span>Tornei</span></div><div><strong>{player.stats.wins}</strong><span>Vittorie</span></div><div><strong>{player.stats.winPercentage}%</strong><span>Vittorie</span></div></div>
    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Vedi il profilo <ArrowUpRight size={16} /></span>
  </Link>;
}
