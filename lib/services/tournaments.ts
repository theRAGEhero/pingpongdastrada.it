import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, cities, matches, players, tournamentEntries, tournaments } from "@/lib/db/schema";
import { generateRoundRobin, generateSingleElimination, nextMatchTarget, validateSetScore } from "@/lib/domain/tournament";
import { slugify } from "@/lib/utils";

async function audit(actorId: string, action: string, entityId: string, summary: string) {
  await db.insert(auditLogs).values({ id: randomUUID(), actorId, action, entityType: "tournament", entityId, summary });
}

export async function createTournament(input: {
  name: string; startsAt: string; format: "single_elimination" | "round_robin"; venueId?: string;
  description?: string; bestOf?: number; actorId: string;
}) {
  const city = await db.query.cities.findFirst({ where: eq(cities.slug, "bologna") });
  if (!city) throw new Error("Città non configurata.");
  const baseSlug = slugify(input.name);
  const existing = await db.query.tournaments.findFirst({ where: eq(tournaments.slug, baseSlug) });
  const id = randomUUID();
  const slug = existing ? `${baseSlug}-${id.slice(0, 6)}` : baseSlug;
  await db.insert(tournaments).values({
    id, cityId: city.id, name: input.name, slug, startsAt: new Date(input.startsAt).toISOString(),
    format: input.format, venueId: input.venueId || null, description: input.description || null,
    bestOf: input.bestOf ?? 3, status: "draft", registrationStatus: "closed",
  });
  await audit(input.actorId, "tournament.created", id, `Creato il torneo ${input.name}`);
  return { id, slug };
}

export async function setTournamentStatus(id: string, status: "draft" | "upcoming" | "ongoing" | "completed", actorId: string) {
  const tournament = await db.query.tournaments.findFirst({ where: eq(tournaments.id, id) });
  if (!tournament) throw new Error("Torneo non trovato.");
  await db.update(tournaments).set({ status, publishedAt: status === "draft" ? null : tournament.publishedAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(tournaments.id, id));
  await audit(actorId, "tournament.status", id, `Stato aggiornato: ${status}`);
}

export async function generateTournamentMatches(id: string, actorId: string) {
  const tournament = await db.query.tournaments.findFirst({ where: eq(tournaments.id, id), with: { entries: true, matches: true } });
  if (!tournament) throw new Error("Torneo non trovato.");
  if (tournament.matches.length) throw new Error("Il tabellone esiste già. Per rigenerarlo occorre prima azzerare i risultati.");
  const generated = tournament.format === "round_robin" ? generateRoundRobin(tournament.entries) : generateSingleElimination(tournament.entries);

  db.transaction((tx) => {
    const matchIds = new Map<string, string>();
    for (const match of generated) {
      const matchId = randomUUID();
      matchIds.set(`${match.round}:${match.bracketPosition}`, matchId);
      tx.insert(matches).values({ id: matchId, tournamentId: id, ...match }).run();
    }
    for (const match of generated.filter((item) => item.status === "bye" && item.winnerEntryId)) {
      const target = nextMatchTarget(match);
      const targetId = matchIds.get(`${target.round}:${target.bracketPosition}`);
      if (!targetId) continue;
      tx.update(matches).set(target.slot === "home" ? { homeEntryId: match.winnerEntryId } : { awayEntryId: match.winnerEntryId }).where(eq(matches.id, targetId)).run();
    }
    tx.insert(auditLogs).values({ id: randomUUID(), actorId, action: "tournament.bracket_generated", entityType: "tournament", entityId: id, summary: `Generati ${generated.length} incontri` }).run();
  });
}

export async function recordMatchScore(matchId: string, homeScore: number, awayScore: number, actorId: string) {
  const match = await db.query.matches.findFirst({ where: eq(matches.id, matchId) });
  if (!match) throw new Error("Partita non trovata.");
  if (!match.homeEntryId || !match.awayEntryId) throw new Error("La partita non ha ancora due avversari.");
  const tournament = await db.query.tournaments.findFirst({ where: eq(tournaments.id, match.tournamentId), with: { matches: true } });
  if (!tournament) throw new Error("Torneo non trovato.");
  const validation = validateSetScore(homeScore, awayScore, tournament.bestOf);
  if (validation) throw new Error(validation);
  const winnerEntryId = homeScore > awayScore ? match.homeEntryId : match.awayEntryId;
  const target = tournament.format === "single_elimination" ? nextMatchTarget(match) : null;
  const next = target ? tournament.matches.find((item) => item.round === target.round && item.bracketPosition === target.bracketPosition) : null;
  if (next?.status === "completed") throw new Error("Il turno successivo è già concluso: correggi prima quel risultato.");

  db.transaction((tx) => {
    tx.update(matches).set({ homeScore, awayScore, winnerEntryId, status: "completed", updatedAt: new Date().toISOString() }).where(eq(matches.id, matchId)).run();
    if (next && target) {
      tx.update(matches).set(target.slot === "home" ? { homeEntryId: winnerEntryId } : { awayEntryId: winnerEntryId }).where(eq(matches.id, next.id)).run();
    }
    tx.insert(auditLogs).values({ id: randomUUID(), actorId, action: "match.score_recorded", entityType: "tournament", entityId: tournament.id, summary: `Risultato inserito: ${homeScore}–${awayScore}`, metadata: JSON.stringify({ matchId }) }).run();
  });
}

export async function addParticipant(tournamentId: string, displayName: string, seed: number | undefined, actorId: string) {
  const tournament = await db.query.tournaments.findFirst({ where: eq(tournaments.id, tournamentId), with: { matches: true } });
  if (!tournament) throw new Error("Torneo non trovato.");
  if (tournament.matches.length) throw new Error("Non puoi aggiungere partecipanti dopo la generazione del tabellone.");
  const id = randomUUID();
  await db.insert(tournamentEntries).values({ id, tournamentId, displayName, seed: seed ?? null });
  await audit(actorId, "tournament.participant_added", tournamentId, `Partecipante aggiunto: ${displayName}`);
  return id;
}

export async function linkParticipant(entryId: string, playerId: string, actorId: string) {
  const entry = await db.query.tournamentEntries.findFirst({ where: eq(tournamentEntries.id, entryId) });
  const player = await db.query.players.findFirst({ where: eq(players.id, playerId) });
  if (!entry || !player) throw new Error("Partecipante o profilo non trovato.");
  await db.update(tournamentEntries).set({ playerId }).where(eq(tournamentEntries.id, entryId));
  await audit(actorId, "tournament.participant_linked", entry.tournamentId, `Partecipante collegato al profilo ${player.displayName}`);
}

export async function getTournamentExport(id: string) {
  const tournament = await db.query.tournaments.findFirst({ where: eq(tournaments.id, id), with: { venue: true, entries: true, matches: true } });
  if (!tournament) throw new Error("Torneo non trovato.");
  return tournament;
}

export async function findCity() {
  return db.query.cities.findFirst({ where: eq(cities.slug, "bologna") });
}

export async function removeParticipant(entryId: string, actorId: string) {
  const entry = await db.query.tournamentEntries.findFirst({ where: eq(tournamentEntries.id, entryId) });
  if (!entry) throw new Error("Partecipante non trovato.");
  const related = await db.query.matches.findFirst({ where: and(eq(matches.tournamentId, entry.tournamentId)) });
  if (related) throw new Error("Il tabellone è già stato generato.");
  await db.delete(tournamentEntries).where(eq(tournamentEntries.id, entryId));
  await audit(actorId, "tournament.participant_removed", entry.tournamentId, "Partecipante rimosso");
}
