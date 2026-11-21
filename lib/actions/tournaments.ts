"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth-utils";
import { addParticipant, createTournament, generateTournamentMatches, linkParticipant, recordMatchScore, removeParticipant, setTournamentStatus } from "@/lib/services/tournaments";

export type ActionState = { error?: string; success?: string };
const organizerRoles = ["admin", "organizer"] as const;

function refresh(id?: string) {
  revalidatePath("/");
  revalidatePath("/tornei");
  revalidatePath("/statistiche");
  revalidatePath("/admin/tornei");
  if (id) revalidatePath(`/admin/tornei/${id}`);
}

export async function createTournamentAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole([...organizerRoles]);
  const parsed = z.object({
    name: z.string().trim().min(3).max(140), startsAt: z.string().datetime({ local: true }),
    format: z.enum(["single_elimination", "round_robin"]), venueId: z.string().optional(),
    description: z.string().max(3000).optional(), bestOf: z.coerce.number().int().refine((value) => [1,3,5,7].includes(value)),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Controlla nome, data e formato del torneo." };
  try {
    const tournament = await createTournament({ ...parsed.data, actorId: user.id });
    refresh(tournament.id);
    redirect(`/admin/tornei/${tournament.id}`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    throw error;
  }
}

export async function updateTournamentStatusAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole([...organizerRoles]);
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["draft", "upcoming", "ongoing", "completed"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Richiesta non valida." };
  try { await setTournamentStatus(parsed.data.id, parsed.data.status, user.id); refresh(parsed.data.id); return { success: "Stato aggiornato." }; }
  catch (error) { return { error: error instanceof Error ? error.message : "Aggiornamento non riuscito." }; }
}

export async function generateMatchesAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole([...organizerRoles]);
  const id = String(formData.get("id") ?? "");
  try { await generateTournamentMatches(id, user.id); refresh(id); return { success: "Tabellone generato. Controlla gli abbinamenti e inserisci i risultati." }; }
  catch (error) { return { error: error instanceof Error ? error.message : "Generazione non riuscita." }; }
}

export async function addParticipantAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole([...organizerRoles]);
  const parsed = z.object({ tournamentId: z.string().uuid(), displayName: z.string().trim().min(2).max(80), seed: z.coerce.number().int().positive().optional().or(z.literal("")), playerId: z.string().optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Inserisci un nome valido e una testa di serie positiva." };
  try {
    const entryId = await addParticipant(parsed.data.tournamentId, parsed.data.displayName, parsed.data.seed === "" ? undefined : parsed.data.seed, user.id);
    if (parsed.data.playerId) await linkParticipant(entryId, parsed.data.playerId, user.id);
    refresh(parsed.data.tournamentId);
    return { success: "Partecipante aggiunto. Il profilo pubblico non cambia automaticamente." };
  } catch (error) { return { error: error instanceof Error ? error.message : "Inserimento non riuscito." }; }
}

export async function removeParticipantAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole([...organizerRoles]);
  const entryId = String(formData.get("entryId") ?? "");
  const tournamentId = String(formData.get("tournamentId") ?? "");
  try { await removeParticipant(entryId, user.id); refresh(tournamentId); return { success: "Partecipante rimosso." }; }
  catch (error) { return { error: error instanceof Error ? error.message : "Rimozione non riuscita." }; }
}

export async function recordScoreAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole([...organizerRoles]);
  const parsed = z.object({ matchId: z.string().uuid(), tournamentId: z.string().uuid(), homeScore: z.coerce.number().int(), awayScore: z.coerce.number().int() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Punteggi non validi." };
  try { await recordMatchScore(parsed.data.matchId, parsed.data.homeScore, parsed.data.awayScore, user.id); refresh(parsed.data.tournamentId); return { success: "Risultato salvato e vincitore avanzato." }; }
  catch (error) { return { error: error instanceof Error ? error.message : "Salvataggio non riuscito." }; }
}
