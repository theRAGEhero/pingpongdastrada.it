export type BracketEntry = {
  id: string;
  displayName: string;
  seed?: number | null;
};

export type GeneratedMatch = {
  round: number;
  bracketPosition: number;
  homeEntryId: string | null;
  awayEntryId: string | null;
  status: "scheduled" | "bye";
  winnerEntryId: string | null;
};

export function seedOrder(size: number): number[] {
  if (size < 2 || !Number.isInteger(size) || (size & (size - 1)) !== 0) {
    throw new Error("La dimensione del tabellone deve essere una potenza di due.");
  }
  let order = [1, 2];
  for (let current = 2; current < size; current *= 2) {
    order = order.flatMap((seed) => [seed, current * 2 + 1 - seed]);
  }
  return order;
}

export function generateSingleElimination(entries: BracketEntry[]): GeneratedMatch[] {
  if (entries.length < 2) throw new Error("Servono almeno due partecipanti.");
  const ordered = [...entries].sort((a, b) => (a.seed ?? 1_000_000) - (b.seed ?? 1_000_000));
  let bracketSize = 2;
  while (bracketSize < ordered.length) bracketSize *= 2;
  const order = seedOrder(bracketSize);
  const result: GeneratedMatch[] = [];
  const rounds = Math.log2(bracketSize);

  for (let position = 0; position < bracketSize / 2; position += 1) {
    const home = ordered[order[position * 2] - 1] ?? null;
    const away = ordered[order[position * 2 + 1] - 1] ?? null;
    const winner = home && !away ? home : away && !home ? away : null;
    result.push({
      round: 1,
      bracketPosition: position,
      homeEntryId: home?.id ?? null,
      awayEntryId: away?.id ?? null,
      status: winner ? "bye" : "scheduled",
      winnerEntryId: winner?.id ?? null,
    });
  }

  for (let round = 2; round <= rounds; round += 1) {
    const count = bracketSize / 2 ** round;
    for (let position = 0; position < count; position += 1) {
      result.push({ round, bracketPosition: position, homeEntryId: null, awayEntryId: null, status: "scheduled", winnerEntryId: null });
    }
  }
  return result;
}

export function nextMatchTarget(match: Pick<GeneratedMatch, "round" | "bracketPosition">) {
  return { round: match.round + 1, bracketPosition: Math.floor(match.bracketPosition / 2), slot: match.bracketPosition % 2 === 0 ? "home" : "away" } as const;
}

export function generateRoundRobin(entries: BracketEntry[]): GeneratedMatch[] {
  if (entries.length < 2) throw new Error("Servono almeno due partecipanti.");
  const rotation: Array<string | null> = entries.map((entry) => entry.id);
  if (rotation.length % 2 !== 0) rotation.push(null);
  const rounds = rotation.length - 1;
  const result: GeneratedMatch[] = [];

  for (let round = 0; round < rounds; round += 1) {
    for (let position = 0; position < rotation.length / 2; position += 1) {
      const home = rotation[position];
      const away = rotation[rotation.length - 1 - position];
      if (home && away) {
        result.push({ round: round + 1, bracketPosition: position, homeEntryId: home, awayEntryId: away, status: "scheduled", winnerEntryId: null });
      }
    }
    rotation.splice(1, 0, rotation.pop() ?? null);
  }
  return result;
}

export function validateSetScore(homeScore: number, awayScore: number, bestOf: number) {
  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
    return "I punteggi devono essere numeri interi non negativi.";
  }
  if (!Number.isInteger(bestOf) || bestOf < 1 || bestOf % 2 === 0) {
    return "Il formato deve essere al meglio di un numero dispari di set.";
  }
  const target = Math.ceil(bestOf / 2);
  if (homeScore > target || awayScore > target || Math.max(homeScore, awayScore) !== target || homeScore === awayScore) {
    return `Con il formato al meglio di ${bestOf}, il vincitore deve conquistare ${target} set.`;
  }
  return null;
}

export type Standing = {
  entryId: string;
  displayName: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  difference: number;
  winPercentage: number;
};

export function calculateStandings(
  entries: BracketEntry[],
  matches: Array<{ homeEntryId: string | null; awayEntryId: string | null; homeScore: number | null; awayScore: number | null; status: string }>,
): Standing[] {
  const rows = new Map(entries.map((entry) => [entry.id, {
    entryId: entry.id, displayName: entry.displayName, played: 0, wins: 0, losses: 0,
    pointsFor: 0, pointsAgainst: 0, difference: 0, winPercentage: 0,
  }]));

  for (const match of matches) {
    if (match.status !== "completed" || !match.homeEntryId || !match.awayEntryId || match.homeScore === null || match.awayScore === null) continue;
    const home = rows.get(match.homeEntryId);
    const away = rows.get(match.awayEntryId);
    if (!home || !away) continue;
    home.played += 1;
    away.played += 1;
    home.pointsFor += match.homeScore;
    home.pointsAgainst += match.awayScore;
    away.pointsFor += match.awayScore;
    away.pointsAgainst += match.homeScore;
    if (match.homeScore > match.awayScore) { home.wins += 1; away.losses += 1; }
    else { away.wins += 1; home.losses += 1; }
  }

  return [...rows.values()].map((row) => ({
    ...row,
    difference: row.pointsFor - row.pointsAgainst,
    winPercentage: row.played ? Math.round((row.wins / row.played) * 1000) / 10 : 0,
  })).sort((a, b) => b.wins - a.wins || b.difference - a.difference || b.pointsFor - a.pointsFor || a.displayName.localeCompare(b.displayName, "it"));
}
