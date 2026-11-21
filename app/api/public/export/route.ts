import { getMilestones, getProjects, getPublicEvents, getPublicPlayers, getPublicTournaments, getPublicTournament, getPublicVenues } from "@/lib/data/public";
import { jsonDownload } from "@/lib/domain/export";

export const dynamic = "force-dynamic";
export async function GET() {
  const [venueRecords,eventRecords,projectRecords,milestoneRecords,tournamentRecords,playerRecords] = await Promise.all([getPublicVenues(),getPublicEvents(),getProjects(),getMilestones(),getPublicTournaments(),getPublicPlayers()]);
  const publicTournaments = await Promise.all(tournamentRecords.map((tournament) => getPublicTournament(tournament.slug)));
  return jsonDownload({
    exportedAt: new Date().toISOString(), scope: "public", source: "Ping Pong da Strada",
    venues: venueRecords, events: eventRecords, projects: projectRecords, milestones: milestoneRecords,
    tournaments: publicTournaments,
    players: playerRecords.map((player) => ({ publicSlug: player.publicSlug, displayName: player.displayName, bio: player.bio, isDemo: player.isDemo, stats: player.stats })),
  }, "pingpongdastrada-dati-pubblici.json");
}
