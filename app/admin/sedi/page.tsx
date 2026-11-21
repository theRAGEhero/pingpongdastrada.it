import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { venues, venueSuggestions } from "@/lib/db/schema";
import { VenueForm } from "@/components/admin/content-forms";
import { SuggestionModeration } from "@/components/admin/suggestion-moderation";
import { VerificationBadge } from "@/components/ui";

export const dynamic = "force-dynamic";
export default async function AdminVenuesPage() {
  const [pending, allVenues] = await Promise.all([db.query.venueSuggestions.findMany({ where: eq(venueSuggestions.status,"pending"), orderBy: [desc(venueSuggestions.createdAt)] }), db.query.venues.findMany({ orderBy: [venues.name] })]);
  return <><p className="eyebrow">Luoghi e verifiche</p><h1 className="display my-2 text-5xl">Mappa e segnalazioni</h1><section className="my-8"><h2 className="display text-3xl">Da moderare ({pending.length})</h2>{pending.length ? <div className="grid grid-2">{pending.map((suggestion) => <article className="card card-solid" key={suggestion.id}><h3>{suggestion.name}</h3><p>{suggestion.address ?? "Nessun indirizzo indicato"}</p>{suggestion.latitude && <p className="text-xs">Coordinate: {suggestion.latitude}, {suggestion.longitude}</p>}<p>{suggestion.notes ?? "Nessuna nota."}</p><SuggestionModeration id={suggestion.id} /></article>)}</div> : <p className="empty-state">Nessuna segnalazione in attesa.</p>}</section><details className="card card-lime my-8"><summary className="cursor-pointer text-xl font-black">Inserisci una sede verificata</summary><p className="muted">Approvare una segnalazione non la pubblica automaticamente: qui vanno inseriti e controllati tutti i campi.</p><div className="mt-6"><VenueForm /></div></details><section><h2 className="display text-3xl">Sedi registrate ({allVenues.length})</h2><div className="grid grid-2">{allVenues.map((venue) => <article className="card" key={venue.id}><VerificationBadge status={venue.verificationStatus} /><h3>{venue.name}</h3><p className="text-sm">Stato: {venue.status} · Tavoli: {venue.tableCount ?? "da verificare"}</p><p className="text-xs">Fonte: {venue.source ?? "non inserita"}</p></article>)}</div></section></>;
}
