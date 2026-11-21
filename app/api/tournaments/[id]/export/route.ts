import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { getPublicTournament } from "@/lib/data/public";
import { jsonDownload, toCsv } from "@/lib/domain/export";

export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await db.query.tournaments.findFirst({ where: and(eq(tournaments.id,id),ne(tournaments.status,"draft")) });
  if (!record) return Response.json({ error: "Torneo non trovato." }, { status: 404 });
  const tournament = await getPublicTournament(record.slug);
  if (!tournament) return Response.json({ error: "Torneo non trovato." }, { status: 404 });
  if (new URL(request.url).searchParams.get("format") === "csv") {
    const names = new Map(tournament.entries.map((entry) => [entry.id,entry.displayName]));
    const csv = toCsv(["turno","incontro","giocatore_casa","giocatore_trasferta","set_casa","set_trasferta","stato"], tournament.matches.map((match) => [match.round,match.bracketPosition+1,names.get(match.homeEntryId ?? "") ?? "",names.get(match.awayEntryId ?? "") ?? "",match.homeScore,match.awayScore,match.status]));
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="torneo-${tournament.slug}.csv"` } });
  }
  return jsonDownload({ exportedAt: new Date().toISOString(), scope: "public", tournament }, `torneo-${tournament.slug}.json`);
}
