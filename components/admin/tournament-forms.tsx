"use client";

import { useActionState } from "react";
import { createTournamentAction, updateTournamentStatusAction } from "@/lib/actions/tournaments";
import type { Venue } from "@/lib/db/schema";
import { tournamentStatus } from "@/lib/utils";

export function CreateTournamentForm({ venues }: { venues: Venue[] }) {
  const [state, action, pending] = useActionState(createTournamentAction, {});
  return <form action={action} className="form-grid">{state.error && <p className="form-error" role="alert">{state.error}</p>}<div className="form-grid form-grid-2"><div className="field"><label htmlFor="name">Nome del torneo *</label><input className="input" id="name" name="name" required minLength={3} /></div><div className="field"><label htmlFor="startsAt">Data e ora *</label><input className="input" id="startsAt" name="startsAt" type="datetime-local" required /></div></div><div className="form-grid form-grid-2"><div className="field"><label htmlFor="format">Formato</label><select className="select" id="format" name="format"><option value="single_elimination">Eliminazione diretta</option><option value="round_robin">Girone all’italiana</option></select></div><div className="field"><label htmlFor="bestOf">Partite al meglio di</label><select className="select" id="bestOf" name="bestOf" defaultValue="3">{[1,3,5,7].map((value) => <option key={value} value={value}>{value} set</option>)}</select></div></div><div className="field"><label htmlFor="venueId">Luogo</label><select className="select" id="venueId" name="venueId"><option value="">Da definire</option>{venues.map((venue) => <option value={venue.id} key={venue.id}>{venue.name}</option>)}</select></div><div className="field"><label htmlFor="description">Presentazione</label><textarea className="textarea" id="description" name="description" /></div><button className="btn btn-primary w-fit" disabled={pending}>{pending ? "Creazione…" : "Crea come bozza"}</button></form>;
}

export function TournamentStatusForm({ id, current }: { id: string; current: string }) {
  const [state, action, pending] = useActionState(updateTournamentStatusAction, {});
  return <form action={action}><input type="hidden" name="id" value={id} />{state.error && <p className="form-error" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">{state.success}</p>}<div className="flex flex-wrap items-end gap-2"><div className="field"><label htmlFor="status">Stato editoriale</label><select className="select" id="status" name="status" defaultValue={current}>{Object.entries(tournamentStatus).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></div><button className="btn btn-dark" disabled={pending}>Salva stato</button></div><p className="muted mt-2 text-xs">Bozza = invisibile pubblicamente. Gli altri stati rendono il torneo visibile.</p></form>;
}
