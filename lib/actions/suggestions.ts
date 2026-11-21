"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { venueSuggestions } from "@/lib/db/schema";

const schema = z.object({
  name: z.string().trim().min(2, "Inserisci il nome del luogo.").max(120),
  address: z.string().trim().max(200).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional(),
});

export type SuggestionState = { success?: string; error?: string };
export async function submitVenueSuggestion(_previous: SuggestionState, formData: FormData): Promise<SuggestionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Controlla i dati inseriti." };
  await db.insert(venueSuggestions).values({
    id: randomUUID(), name: parsed.data.name, address: parsed.data.address || null,
    latitude: parsed.data.latitude === "" || parsed.data.latitude === undefined ? null : parsed.data.latitude,
    longitude: parsed.data.longitude === "" || parsed.data.longitude === undefined ? null : parsed.data.longitude,
    notes: parsed.data.notes || null,
  });
  return { success: "Grazie! La segnalazione è in attesa di verifica da parte degli organizzatori." };
}
