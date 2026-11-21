import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { icsDate, icsEscape } from "@/lib/domain/export";

export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await db.query.events.findFirst({ where: and(eq(events.id,id),eq(events.status,"published")), with: { venue: true } });
  if (!event) return Response.json({ error: "Evento non trovato." }, { status: 404 });
  const end = event.endsAt ?? new Date(new Date(event.startsAt).getTime() + 2 * 60 * 60 * 1000).toISOString();
  const location = [event.venue?.name ?? event.locationText,event.venue?.address].filter(Boolean).join(", ");
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Ping Pong da Strada//Eventi//IT","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",`UID:${event.id}@pingpongdastrada.it`,`DTSTAMP:${icsDate(new Date().toISOString())}`,`DTSTART:${icsDate(event.startsAt)}`,`DTEND:${icsDate(end)}`,`SUMMARY:${icsEscape(event.title)}`,`DESCRIPTION:${icsEscape(event.description ?? "")}`,`LOCATION:${icsEscape(location)}`,`URL:${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/eventi/${event.slug}`,"END:VEVENT","END:VCALENDAR",""].join("\r\n");
  return new Response(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${event.slug}.ics"` } });
}
