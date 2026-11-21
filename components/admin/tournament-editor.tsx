"use client";

import { useActionState } from "react";
import { addParticipantAction, generateMatchesAction, recordScoreAction, removeParticipantAction } from "@/lib/actions/tournaments";
import type { Match, Player, TournamentEntry } from "@/lib/db/schema";

function Feedback({ state }: { state: { error?: string; success?: string } }) {
  return <>{state.error && <p className="form-error" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">{state.success}</p>}</>;
}

export function GenerateMatchesButton({ tournamentId }: { tournamentId: string }) {
  const [state, action, pending] = useActionState(generateMatchesAction, {});
  return <form action={action}><input type="hidden" name="id" value={tournamentId} /><Feedback state={state} /><button className="btn btn-primary" disabled={pending}>{pending ? "Generazione…" : "Genera abbinamenti"}</button><p className="muted text-xs">Operazione disponibile una sola volta: controlla prima partecipanti e teste di serie.</p></form>;
}

export function AddParticipantForm({ tournamentId, players }: { tournamentId: string; players: Player[] }) {
  const [state, action, pending] = useActionState(addParticipantAction, {});
  return <form action={action} className="form-grid"><input type="hidden" name="tournamentId" value={tournamentId} /><Feedback state={state} /><div className="field"><label htmlFor="displayName">Nome operativo *</label><input className="input" id="displayName" name="displayName" required /><p className="muted m-0 text-xs">Resta riservato agli organizzatori se non colleghi un profilo pubblico.</p></div><div className="form-grid form-grid-2"><div className="field"><label htmlFor="seed">Testa di serie</label><input className="input" id="seed" name="seed" type="number" min="1" /></div><div className="field"><label htmlFor="playerId">Profilo collegato</label><select className="select" id="playerId" name="playerId"><option value="">Nessuno · partecipazione privata</option>{players.map((player) => <option key={player.id} value={player.id}>{player.displayName} · {player.visibility === "public" ? "pubblico" : "privato"}</option>)}</select></div></div><button className="btn btn-dark w-fit" disabled={pending}>Aggiungi partecipante</button></form>;
}

export function RemoveParticipantButton({ entryId, tournamentId }: { entryId: string; tournamentId: string }) {
  const [state, action] = useActionState(removeParticipantAction, {});
  return <form action={action}><input type="hidden" name="entryId" value={entryId} /><input type="hidden" name="tournamentId" value={tournamentId} /><button className="text-xs font-bold underline" aria-label="Rimuovi partecipante">Rimuovi</button>{state.error && <span className="block text-xs text-red-800">{state.error}</span>}</form>;
}

export function ScoreForm({ match, tournamentId, entries, bestOf }: { match: Match; tournamentId: string; entries: TournamentEntry[]; bestOf: number }) {
  const [state, action, pending] = useActionState(recordScoreAction, {});
  const entryMap = new Map(entries.map((entry) => [entry.id, entry.displayName]));
  const home = entryMap.get(match.homeEntryId ?? "");
  const away = entryMap.get(match.awayEntryId ?? "");
  const ready = Boolean(home && away && match.status !== "bye");
  return <div className="card !p-4"><p className="m-0 text-xs font-bold">Turno {match.round} · incontro {match.bracketPosition + 1}</p>{ready ? <form action={action}><input type="hidden" name="matchId" value={match.id} /><input type="hidden" name="tournamentId" value={tournamentId} /><div className="mt-3 grid grid-cols-[1fr_60px] items-center gap-2"><label htmlFor={`home-${match.id}`} className="truncate text-sm font-bold">{home}</label><input className="input !min-h-10 !p-1 text-center" id={`home-${match.id}`} name="homeScore" type="number" min="0" max={Math.ceil(bestOf/2)} defaultValue={match.homeScore ?? ""} required /><label htmlFor={`away-${match.id}`} className="truncate text-sm font-bold">{away}</label><input className="input !min-h-10 !p-1 text-center" id={`away-${match.id}`} name="awayScore" type="number" min="0" max={Math.ceil(bestOf/2)} defaultValue={match.awayScore ?? ""} required /></div><button className="btn btn-outline btn-small mt-3" disabled={pending}>Salva risultato</button><Feedback state={state} /></form> : <p className="muted mt-3 text-sm">{match.status === "bye" ? `${home ?? away ?? "Partecipante"} avanza con un bye.` : "In attesa degli avversari del turno precedente."}</p>}</div>;
}
