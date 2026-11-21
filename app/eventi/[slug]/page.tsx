import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Download, MapPin } from "lucide-react";
import { getPublicEvent } from "@/lib/data/public";
import { eventTypeLabels, formatDateTime, safeExternalUrl } from "@/lib/utils";
import { DemoBadge } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Evento" };

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event) notFound();
  const registrationUrl = safeExternalUrl(event.registrationUrl);
  return <><section className="section-compact bg-ball"><div className="container"><Link href="/eventi" className="inline-flex items-center gap-2 font-bold"><ArrowLeft size={16} /> Tutti gli eventi</Link><div className="mt-8 flex gap-2"><span className="badge">{eventTypeLabels[event.type] ?? event.type}</span>{event.isDemo && <DemoBadge />}</div><h1 className="display my-5 max-w-5xl text-[clamp(3rem,8vw,7rem)] font-black uppercase">{event.title}</h1></div></section><section className="section"><div className="container split split-wide"><div><p className="eyebrow">Che cosa succede</p><p className="prose-large">{event.description ?? "La descrizione non è ancora stata inserita."}</p>{registrationUrl && <a className="btn btn-primary mt-5" href={registrationUrl} rel="noreferrer">Link per partecipare</a>}</div><aside className="card card-solid"><h2 className="display text-3xl">Quando e dove</h2><p className="flex gap-2"><CalendarDays className="shrink-0" /> <span>{formatDateTime(event.startsAt)}{event.endsAt && <> –<br />{formatDateTime(event.endsAt)}</>}</span></p><p className="flex gap-2"><MapPin className="shrink-0" /><span>{event.venue?.name ?? event.locationText ?? "Luogo in aggiornamento"}{event.venue?.address && <><br />{event.venue.address}</>}</span></p><a className="btn btn-outline btn-small" href={`/api/events/${event.id}/ics`}><Download size={15} /> Aggiungi al calendario</a>{event.source && <p className="muted mt-4 text-xs">Fonte: {event.source}</p>}</aside></div></section></>;
}
