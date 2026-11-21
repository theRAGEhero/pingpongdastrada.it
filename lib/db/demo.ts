import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index";
import { ensureBaseData } from "./seed";
import { cities, communityProjects, events, players, tournaments, tournamentEntries, matches, venues } from "./schema";

migrate(db, { migrationsFolder: "./drizzle" });
await ensureBaseData();
const existing = await db.query.tournaments.findFirst({ where: eq(tournaments.slug, "demo-torneo-della-montagnola") });
if (existing) {
  console.log("Dati DEMO già presenti; nessuna modifica effettuata.");
  process.exit(0);
}
const city = await db.query.cities.findFirst({ where: eq(cities.slug, "bologna") });
if (!city) throw new Error("Città non trovata.");
const venueId = randomUUID();
await db.insert(venues).values({
  id: venueId, cityId: city.id, name: "Parco DEMO", slug: "parco-demo", address: "Bologna · indirizzo dimostrativo",
  description: "Sede fittizia creata esclusivamente per provare la piattaforma.", latitude: 44.502685, longitude: 11.346761,
  tableCount: 2, indoor: false, access: "Accesso libero · dato dimostrativo", openingHours: "Orari da verificare",
  accessibility: "Informazioni dimostrative", verificationStatus: "unverified", source: "DEMO", status: "published", isDemo: true,
});
const people = ["Andrea DEMO", "Bianca DEMO", "Carlo DEMO", "Daria DEMO"].map((name, index) => ({
  id: randomUUID(), cityId: city.id, publicSlug: `demo-giocatore-${index + 1}`, displayName: name,
  bio: "Profilo fittizio per dimostrare le funzionalità.", visibility: "public", consentAt: new Date().toISOString(), isDemo: true,
}));
await db.insert(players).values(people);
const completedId = randomUUID();
const past = new Date(); past.setUTCDate(past.getUTCDate() - 21); past.setUTCHours(15, 0, 0, 0);
await db.insert(tournaments).values({
  id: completedId, cityId: city.id, venueId, name: "Torneo DEMO della Montagnola", slug: "demo-torneo-della-montagnola",
  description: "Un torneo completamente fittizio per esplorare tabelloni, risultati e statistiche.", startsAt: past.toISOString(),
  endsAt: new Date(past.getTime() + 3 * 60 * 60 * 1000).toISOString(), format: "single_elimination", status: "completed",
  bestOf: 3, source: "DEMO", dataStatus: "demo", isDemo: true, publishedAt: new Date().toISOString(),
});
const entryIds = new Map<string, string>();
await db.insert(tournamentEntries).values(people.map((person, index) => {
  const id = randomUUID(); entryIds.set(person.id, id);
  return { id, tournamentId: completedId, playerId: person.id, displayName: person.displayName, seed: index + 1 };
}));
const e = people.map((person) => entryIds.get(person.id)!);
await db.insert(matches).values([
  { id: randomUUID(), tournamentId: completedId, round: 1, bracketPosition: 0, homeEntryId: e[0], awayEntryId: e[3], homeScore: 2, awayScore: 1, winnerEntryId: e[0], status: "completed" },
  { id: randomUUID(), tournamentId: completedId, round: 1, bracketPosition: 1, homeEntryId: e[1], awayEntryId: e[2], homeScore: 0, awayScore: 2, winnerEntryId: e[2], status: "completed" },
  { id: randomUUID(), tournamentId: completedId, round: 2, bracketPosition: 0, homeEntryId: e[0], awayEntryId: e[2], homeScore: 2, awayScore: 0, winnerEntryId: e[0], status: "completed" },
]);
const future = new Date(); future.setUTCDate(future.getUTCDate() + 14); future.setUTCHours(15, 0, 0, 0);
await db.insert(tournaments).values({
  id: randomUUID(), cityId: city.id, venueId, name: "Prossimo torneo DEMO", slug: "demo-prossimo-torneo",
  description: "Evento fittizio: non è una reale iscrizione aperta.", startsAt: future.toISOString(), format: "round_robin",
  status: "upcoming", registrationStatus: "closed", bestOf: 3, source: "DEMO", dataStatus: "demo", isDemo: true, publishedAt: new Date().toISOString(),
});
await db.insert(events).values({
  id: randomUUID(), cityId: city.id, venueId, title: "Pomeriggio di gioco DEMO", slug: "demo-pomeriggio-di-gioco", type: "free_play",
  description: "Evento fittizio per provare calendario ed esportazione ICS.", startsAt: new Date(future.getTime() + 86400000).toISOString(),
  endsAt: new Date(future.getTime() + 90000000).toISOString(), source: "DEMO", status: "published", isDemo: true,
});
await db.insert(communityProjects).values({
  id: randomUUID(), cityId: city.id, title: "Progetto collettivo DEMO", slug: "demo-progetto-collettivo",
  summary: "Un progetto fittizio per mostrare come raccontare le iniziative senza inventare importi o risultati.",
  category: "community", source: "DEMO", verificationStatus: "unverified", status: "published", isDemo: true,
});
console.log("Dati DEMO inseriti. Ogni contenuto è marcato come dimostrativo.");
