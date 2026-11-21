import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { canPublishPlayer } from "@/lib/domain/privacy";
import { events, milestones, players, tournaments, venues, communityProjects } from "@/lib/db/schema";

export async function getPublicVenues() {
  return db.query.venues.findMany({ where: eq(venues.status, "published"), orderBy: [asc(venues.name)] });
}

export async function getPublicTournaments() {
  return db.query.tournaments.findMany({
    where: ne(tournaments.status, "draft"),
    with: { venue: true, entries: true, matches: true },
    orderBy: [desc(tournaments.startsAt)],
  });
}

export async function getPublicTournament(slug: string) {
  const tournament = await db.query.tournaments.findFirst({
    where: and(eq(tournaments.slug, slug), ne(tournaments.status, "draft")),
    with: { venue: true, city: true, entries: { with: { player: true } }, matches: true },
  });
  if (!tournament) return null;
  return {
    ...tournament,
    entries: tournament.entries.map((entry) => {
      const player = entry.player && canPublishPlayer(entry.player) ? entry.player : null;
      return {
        id: entry.id,
        displayName: player?.displayName ?? "Profilo privato",
        playerSlug: player?.publicSlug ?? null,
        seed: entry.seed,
      };
    }),
  };
}

export async function getPublicEvents() {
  return db.query.events.findMany({ where: eq(events.status, "published"), with: { venue: true }, orderBy: [asc(events.startsAt)] });
}

export async function getPublicEvent(slug: string) {
  return db.query.events.findFirst({ where: and(eq(events.slug, slug), eq(events.status, "published")), with: { venue: true } });
}

export async function getMilestones() {
  return db.query.milestones.findMany({ where: eq(milestones.status, "published"), orderBy: [asc(milestones.occurredOn)] });
}

export async function getProjects() {
  return db.query.communityProjects.findMany({ where: eq(communityProjects.status, "published"), orderBy: [desc(communityProjects.createdAt)] });
}

export async function getPublicPlayers() {
  const records = await db.query.players.findMany({ where: eq(players.visibility, "public"), orderBy: [asc(players.displayName)] });
  const eligible = records.filter(canPublishPlayer);
  const entries = await db.query.tournamentEntries.findMany({ with: { tournament: true, player: true } });
  const allTournaments = await db.query.tournaments.findMany({ where: ne(tournaments.status, "draft"), with: { matches: true } });
  const matches = allTournaments.flatMap((tournament) => tournament.matches.filter((match) => match.status === "completed"));

  return eligible.map((player) => {
    const playerEntries = entries.filter((entry) => entry.playerId === player.id && entry.tournament.status !== "draft");
    const entryIds = new Set(playerEntries.map((entry) => entry.id));
    const played = matches.filter((match) => entryIds.has(match.homeEntryId ?? "") || entryIds.has(match.awayEntryId ?? ""));
    const wins = played.filter((match) => match.winnerEntryId && entryIds.has(match.winnerEntryId)).length;
    return {
      ...player,
      stats: {
        tournaments: playerEntries.length,
        matches: played.length,
        wins,
        losses: played.length - wins,
        winPercentage: played.length ? Math.round((wins / played.length) * 1000) / 10 : 0,
      },
      recent: playerEntries.map((entry) => entry.tournament).sort((a, b) => b.startsAt.localeCompare(a.startsAt)).slice(0, 5),
    };
  });
}

export async function getPublicPlayer(slug: string) {
  const all = await getPublicPlayers();
  return all.find((player) => player.publicSlug === slug) ?? null;
}

export async function getCommunityStats(filters?: { from?: string; to?: string; venueId?: string }) {
  const [allTournaments, publicVenues] = await Promise.all([getPublicTournaments(), getPublicVenues()]);
  const filteredTournaments = allTournaments.filter((tournament) =>
    (!filters?.from || tournament.startsAt >= filters.from) &&
    (!filters?.to || tournament.startsAt <= `${filters.to}T23:59:59.999Z`) &&
    (!filters?.venueId || tournament.venueId === filters.venueId)
  );
  const completedMatches = filteredTournaments.flatMap((tournament) => tournament.matches).filter((match) => match.status === "completed");
  const monthly = new Map<string, { month: string; tornei: number; partecipazioni: number; partite: number }>();
  for (const tournament of filteredTournaments) {
    const month = tournament.startsAt.slice(0, 7);
    const row = monthly.get(month) ?? { month, tornei: 0, partecipazioni: 0, partite: 0 };
    row.tornei += 1;
    row.partecipazioni += tournament.entries.length;
    row.partite += tournament.matches.filter((match) => match.status === "completed").length;
    monthly.set(month, row);
  }
  const unique = new Set<string>();
  for (const tournament of filteredTournaments) {
    for (const entry of tournament.entries) unique.add(entry.playerId ?? `anonymous-${entry.id}`);
  }
  return {
    tournaments: filteredTournaments.length,
    matches: completedMatches.length,
    participations: filteredTournaments.reduce((total, tournament) => total + tournament.entries.length, 0),
    uniqueParticipants: unique.size,
    venues: publicVenues.filter((venue) => venue.verificationStatus === "verified" && (!filters?.venueId || venue.id === filters.venueId)).length,
    monthly: [...monthly.values()].sort((a, b) => a.month.localeCompare(b.month)),
    hasDemo: filteredTournaments.some((item) => item.isDemo) || publicVenues.some((item) => item.isDemo),
  };
}

export async function getHomeData() {
  const [allTournaments, allEvents, publicVenues, allMilestones, stats] = await Promise.all([
    getPublicTournaments(), getPublicEvents(), getPublicVenues(), getMilestones(), getCommunityStats(),
  ]);
  const now = new Date().toISOString();
  return {
    stats,
    upcoming: allTournaments.filter((item) => item.status === "upcoming" || item.status === "ongoing" || item.startsAt >= now).slice(0, 3),
    latest: allTournaments.filter((item) => item.status === "completed").slice(0, 2),
    events: allEvents.filter((event) => event.startsAt >= now).slice(0, 3),
    venues: publicVenues,
    milestones: allMilestones,
  };
}
