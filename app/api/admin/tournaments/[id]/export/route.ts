import { auth } from "@/auth";
import { getTournamentExport } from "@/lib/services/tournaments";
import { jsonDownload, toCsv } from "@/lib/domain/export";

export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Accesso richiesto." }, { status: 401 });
  if (!["admin","organizer"].includes(session.user.role)) return Response.json({ error: "Non autorizzato." }, { status: 403 });
  const { id } = await params;
  try {
    const tournament = await getTournamentExport(id);
    if (new URL(request.url).searchParams.get("format") === "csv") {
      const names = new Map(tournament.entries.map((entry) => [entry.id,entry.displayName]));
      const csv = toCsv(["turno","incontro","nome_casa","nome_trasferta","set_casa","set_trasferta","stato"], tournament.matches.map((match) => [match.round,match.bracketPosition+1,names.get(match.homeEntryId ?? "") ?? "",names.get(match.awayEntryId ?? "") ?? "",match.homeScore,match.awayScore,match.status]));
      return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="torneo-${tournament.slug}-completo.csv"`, "Cache-Control": "no-store" } });
    }
    return jsonDownload({ exportedAt: new Date().toISOString(), scope: "organizer", tournament }, `torneo-${tournament.slug}-completo.json`);
  } catch { return Response.json({ error: "Torneo non trovato." }, { status: 404 }); }
}
