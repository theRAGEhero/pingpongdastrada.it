import type { Match } from "@/lib/db/schema";
import { formatLabels } from "@/lib/utils";

type Entry = { id: string; displayName: string; seed: number | null; playerSlug?: string | null };

function playerName(entry: Entry | undefined) {
  return entry?.displayName ?? "In attesa";
}

export function Bracket({ matches, entries, format }: { matches: Match[]; entries: Entry[]; format: string }) {
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
  const rounds = new Map<number, Match[]>();
  for (const match of matches) rounds.set(match.round, [...(rounds.get(match.round) ?? []), match]);
  const sortedRounds = [...rounds.entries()].sort(([a], [b]) => a - b);
  if (matches.length === 0) return <p className="muted">Il tabellone non è ancora stato generato.</p>;

  if (format === "round_robin") {
    return <div>{sortedRounds.map(([round, roundMatches]) => <section key={round}><h3 className="match-round-label">Giornata {round}</h3><div className="grid grid-2">{roundMatches.sort((a,b) => a.bracketPosition - b.bracketPosition).map((match) => <MatchCard key={match.id} match={match} entryMap={entryMap} />)}</div></section>)}</div>;
  }

  return <div className="bracket-scroll" role="region" aria-label={`Tabellone ${formatLabels[format]}`} tabIndex={0}><div className="bracket">{sortedRounds.map(([round, roundMatches]) => {
    const label = roundMatches.length === 1 ? "Finale" : roundMatches.length === 2 ? "Semifinali" : roundMatches.length === 4 ? "Quarti" : `Turno ${round}`;
    return <section className="bracket-round" key={round}><h3>{label}</h3>{roundMatches.sort((a,b) => a.bracketPosition - b.bracketPosition).map((match) => <MatchCard key={match.id} match={match} entryMap={entryMap} />)}</section>;
  })}</div></div>;
}

function MatchCard({ match, entryMap }: { match: Match; entryMap: Map<string, Entry> }) {
  const home = entryMap.get(match.homeEntryId ?? "");
  const away = entryMap.get(match.awayEntryId ?? "");
  return <div className="bracket-match">
    <div className={`bracket-player ${match.winnerEntryId === match.homeEntryId && match.homeEntryId ? "winner" : ""}`}><span>{playerName(home)}</span><span className="bracket-score">{match.homeScore ?? (match.status === "bye" ? "BYE" : "–")}</span></div>
    <div className={`bracket-player ${match.winnerEntryId === match.awayEntryId && match.awayEntryId ? "winner" : ""}`}><span>{playerName(away)}</span><span className="bracket-score">{match.awayScore ?? (match.status === "bye" ? "BYE" : "–")}</span></div>
  </div>;
}
