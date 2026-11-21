import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";
import type { Match, Tournament, Venue } from "@/lib/db/schema";
import { formatDate, formatLabels, tournamentStatus } from "@/lib/utils";
import { DemoBadge } from "./ui";

type TournamentCardData = Tournament & { venue: Venue | null; entries: unknown[]; matches: Match[] };

export function TournamentCard({ tournament }: { tournament: TournamentCardData }) {
  return (
    <Link href={`/tornei/${tournament.slug}`} className="card card-solid card-link flex flex-col">
      <div className="flex flex-wrap gap-2">
        <span className="badge">{tournamentStatus[tournament.status] ?? tournament.status}</span>
        {tournament.isDemo && <DemoBadge />}
      </div>
      <h3>{tournament.name}</h3>
      <div className="card-meta muted">
        <span className="inline-flex items-center gap-1.5"><CalendarDays size={16} aria-hidden="true" />{formatDate(tournament.startsAt)}</span>
        {tournament.venue && <span className="inline-flex items-center gap-1.5"><MapPin size={16} aria-hidden="true" />{tournament.venue.name}</span>}
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 pt-8">
        <div className="text-sm">
          <span className="block font-bold">{formatLabels[tournament.format]}</span>
          <span className="muted inline-flex items-center gap-1"><Users size={14} />{tournament.entries.length || "Da definire"}{tournament.entries.length > 0 && " partecipanti"}</span>
        </div>
        <ArrowUpRight size={26} aria-hidden="true" />
      </div>
    </Link>
  );
}
