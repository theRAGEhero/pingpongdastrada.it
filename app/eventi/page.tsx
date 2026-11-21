import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Download, MapPin } from "lucide-react";
import { getPublicEvents } from "@/lib/data/public";
import { eventTypeLabels, formatDateTime } from "@/lib/utils";
import { PageHero, DemoBadge, DemoNotice, EmptyState } from "@/components/ui";
import { EventCalendar } from "@/components/event-calendar";

export const metadata: Metadata = { title: "Eventi" };
export const dynamic = "force-dynamic";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ vista?: string; tipo?: string }> }) {
  const { vista = "lista", tipo = "" } = await searchParams;
  const events = await getPublicEvents();
  const filtered = events.filter((event) => !tipo || event.type === tipo);
  return <>{events.some((event) => event.isDemo) && <DemoNotice />}<PageHero eyebrow="Gioco libero, incontri e iniziative" title="Ci vediamo lì."><p>Non servono soltanto racchetta e pallina: basta la voglia di esserci. Consulta gli appuntamenti e aggiungili al tuo calendario.</p></PageHero><section className="section"><div className="container">
    <div className="filters"><nav className="flex gap-2" aria-label="Vista eventi"><Link className={`btn btn-small ${vista !== "calendario" ? "btn-dark" : "btn-outline"}`} href="/eventi?vista=lista">Lista</Link><Link className={`btn btn-small ${vista === "calendario" ? "btn-dark" : "btn-outline"}`} href="/eventi?vista=calendario">Calendario</Link></nav><form className="flex flex-wrap items-end gap-2"><input type="hidden" name="vista" value={vista} /><div className="field"><label htmlFor="tipo">Tipo</label><select className="select" id="tipo" name="tipo" defaultValue={tipo}><option value="">Tutte le attività</option>{Object.entries(eventTypeLabels).map(([key,label]) => <option value={key} key={key}>{label}</option>)}</select></div><button className="btn btn-outline">Filtra</button></form></div>
    {filtered.length === 0 ? <EmptyState title="Nessun appuntamento pubblicato">Gli eventi confermati appariranno qui. Non inseriamo date indicative come se fossero appuntamenti ufficiali.</EmptyState> : vista === "calendario" ? <EventCalendar events={filtered} /> : <div className="grid grid-3">{filtered.map((event) => <article className="card card-solid flex flex-col" key={event.id}><div className="flex flex-wrap gap-2"><span className="badge">{eventTypeLabels[event.type] ?? event.type}</span>{event.isDemo && <DemoBadge />}</div><h2 className="display my-4 text-3xl">{event.title}</h2><p className="muted">{event.description ?? "Descrizione in aggiornamento."}</p><div className="card-meta my-5"><span className="inline-flex items-center gap-1"><CalendarDays size={16} />{formatDateTime(event.startsAt)}</span>{(event.venue || event.locationText) && <span className="inline-flex items-center gap-1"><MapPin size={16} />{event.venue?.name ?? event.locationText}</span>}</div><div className="mt-auto flex flex-wrap gap-2"><Link className="btn btn-dark btn-small" href={`/eventi/${event.slug}`}>Dettagli <ArrowUpRight size={15} /></Link><a className="btn btn-outline btn-small" href={`/api/events/${event.id}/ics`}><Download size={15} /> ICS</a></div></article>)}</div>}
  </div></section></>;
}
