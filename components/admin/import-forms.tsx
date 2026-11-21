"use client";

import { useActionState } from "react";
import { uploadParticipantsCsvAction, publishParticipantsImportAction, discardImportAction } from "@/lib/actions/imports";
import type { Tournament } from "@/lib/db/schema";

function Feedback({ state }: { state: { error?: string; success?: string } }) { return <>{state.error && <p className="form-error" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">{state.success}</p>}</>; }

export function CsvUploadForm({ tournaments, selected }: { tournaments: Tournament[]; selected?: string }) {
  const [state, action, pending] = useActionState(uploadParticipantsCsvAction, {});
  return <form action={action} className="form-grid"><Feedback state={state} /><div className="field"><label htmlFor="tournamentId">Torneo di destinazione</label><select className="select" id="tournamentId" name="tournamentId" required defaultValue={selected}><option value="">Seleziona…</option>{tournaments.map((tournament) => <option value={tournament.id} key={tournament.id}>{tournament.name}</option>)}</select></div><div className="field"><label htmlFor="sourceName">Fonte e provenienza *</label><input className="input" id="sourceName" name="sourceName" required minLength={3} placeholder="Es. registro organizzatori, edizione e data" /></div><div className="field"><label htmlFor="file">File CSV *</label><input className="input" id="file" name="file" type="file" accept=".csv,text/csv" required /><p className="muted m-0 text-xs">Massimo 1 MB e 500 righe. Colonne: display_name, seed (facoltativo), public_slug (facoltativo). Non caricare conversazioni o dati di contatto.</p></div><button className="btn btn-primary w-fit" disabled={pending}>{pending ? "Analisi…" : "Carica e revisiona"}</button></form>;
}

export function PublishImportForm({ batchId }: { batchId: string }) {
  const [state, action, pending] = useActionState(publishParticipantsImportAction, {});
  return <form action={action}><input type="hidden" name="batchId" value={batchId} /><Feedback state={state} /><button className="btn btn-primary" disabled={pending}>Conferma e aggiungi al torneo</button></form>;
}

export function DiscardImportForm({ batchId }: { batchId: string }) {
  const [state, action, pending] = useActionState(discardImportAction, {});
  return <form action={action}><input type="hidden" name="batchId" value={batchId} /><Feedback state={state} /><button className="btn btn-outline" disabled={pending}>Scarta importazione</button></form>;
}
