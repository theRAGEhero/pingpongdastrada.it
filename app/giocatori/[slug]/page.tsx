import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Award, CalendarDays } from "lucide-react";
import { getPublicPlayer } from "@/lib/data/public";
import { formatDate } from "@/lib/utils";
import { DemoBadge, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profilo giocatore" };

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await getPublicPlayer(slug);
  if (!player) notFound();
  const achievements = [
    { show: player.stats.tournaments >= 1, title: "Primo torneo", text: "Ha preso parte al primo torneo registrato." },
    { show: player.stats.tournaments >= 5, title: "Presenza abituale", text: "Cinque tornei registrati: la comunità cresce anche così." },
    { show: player.stats.tournaments >= 10, title: "Dieci al tavolo", text: "Dieci partecipazioni documentate." },
  ].filter((item) => item.show);
  return <>
    <section className="section-compact bg-sky"><div className="container"><Link href="/giocatori" className="inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16} /> Tutti i profili</Link><div className="mt-8 flex flex-wrap items-center gap-6"><div className="player-avatar !h-28 !w-28 !text-5xl" aria-hidden="true">{player.displayName.slice(0,1)}</div><div><div className="flex gap-2">{player.isDemo && <DemoBadge />}<span className="badge">Profilo pubblico facoltativo</span></div><h1 className="display my-2 text-[clamp(3rem,8vw,6.5rem)] font-black">{player.displayName}</h1></div></div>{player.bio && <p className="prose-large mt-6 max-w-2xl">{player.bio}</p>}</div></section>
    <section className="section"><div className="container">
      <div className="metric-strip">{[{v:player.stats.tournaments,l:"Tornei"},{v:player.stats.matches,l:"Partite"},{v:`${player.stats.wins}–${player.stats.losses}`,l:"Vittorie · sconfitte"},{v:`${player.stats.winPercentage}%`,l:"Vittorie"}].map((metric) => <div className="metric" key={metric.l}><strong className="metric-value">{metric.v}</strong><span className="metric-label">{metric.l}</span></div>)}</div>
      <div className="split mt-12"><div><p className="eyebrow">Storico</p><h2 className="display text-4xl">I tornei</h2>{player.recent.length ? <div>{player.recent.map((tournament) => <Link href={`/tornei/${tournament.slug}`} className="milestone !grid-cols-1 sm:!grid-cols-[160px_1fr]" key={tournament.id}><time className="milestone-date">{formatDate(tournament.startsAt)}</time><h3>{tournament.name} <ArrowUpRight className="inline" size={20} /></h3></Link>)}</div> : <EmptyState title="Nessun torneo collegato">Le partecipazioni appariranno quando i record dei tornei saranno associati a questo profilo.</EmptyState>}</div>
      <aside><div className="card card-lime"><Award size={30} /><h3>Traguardi</h3>{achievements.length ? <ul>{achievements.map((item) => <li key={item.title} className="mb-4"><strong>{item.title}</strong><p className="m-0 text-sm">{item.text}</p></li>)}</ul> : <p>Nessun traguardo ancora calcolabile dai risultati disponibili.</p>}</div><p className="muted mt-4 text-sm"><CalendarDays className="mr-1 inline" size={15} /> Statistiche calcolate solo sui dati pubblicati; lo storico può essere incompleto.</p></aside></div>
    </div></section>
  </>;
}
