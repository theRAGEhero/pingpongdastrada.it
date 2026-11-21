"use client";

import { useActionState } from "react";
import { submitVenueSuggestion } from "@/lib/actions/suggestions";

export function VenueSuggestionForm() {
  const [state, action, pending] = useActionState(submitVenueSuggestion, {});
  return <form action={action} className="form-grid">
    {state.error && <p className="form-error" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">{state.success}</p>}
    <div className="field"><label htmlFor="name">Nome del luogo *</label><input className="input" id="name" name="name" required maxLength={120} /></div>
    <div className="field"><label htmlFor="address">Indirizzo o riferimento</label><input className="input" id="address" name="address" maxLength={200} /></div>
    <div className="form-grid form-grid-2"><div className="field"><label htmlFor="latitude">Latitudine</label><input className="input" id="latitude" name="latitude" type="number" step="any" min={-90} max={90} /></div><div className="field"><label htmlFor="longitude">Longitudine</label><input className="input" id="longitude" name="longitude" type="number" step="any" min={-180} max={180} /></div></div>
    <div className="field"><label htmlFor="notes">Che cosa hai verificato?</label><textarea className="textarea" id="notes" name="notes" maxLength={1000} placeholder="Numero di tavoli, accesso, stato del luogo. Non inserire dati personali." /></div>
    <button className="btn btn-primary w-fit" disabled={pending}>{pending ? "Invio…" : "Invia per la revisione"}</button>
  </form>;
}
