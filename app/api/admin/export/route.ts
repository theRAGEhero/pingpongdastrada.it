import { auth } from "@/auth";
import { db } from "@/lib/db";
import { jsonDownload } from "@/lib/domain/export";

export const dynamic = "force-dynamic";
export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Accesso richiesto." }, { status: 401 });
  if (session.user.role !== "admin") return Response.json({ error: "Non autorizzato." }, { status: 403 });
  const [cities,venues,players,tournaments,tournamentEntries,matches,events,milestones,communityProjects,importBatches,venueSuggestions,auditLogs] = await Promise.all([
    db.query.cities.findMany(),db.query.venues.findMany(),db.query.players.findMany(),db.query.tournaments.findMany(),db.query.tournamentEntries.findMany(),db.query.matches.findMany(),db.query.events.findMany(),db.query.milestones.findMany(),db.query.communityProjects.findMany(),db.query.importBatches.findMany(),db.query.venueSuggestions.findMany(),db.query.auditLogs.findMany(),
  ]);
  return jsonDownload({ exportedAt: new Date().toISOString(), scope: "admin-portability", note: "Password, sessioni e righe grezze degli import sono esclusi intenzionalmente.", cities,venues,players,tournaments,tournamentEntries,matches,events,milestones,communityProjects,importBatches,venueSuggestions,auditLogs }, "pingpongdastrada-export-gestione.json");
}
