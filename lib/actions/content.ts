"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { auditLogs, cities, communityProjects, events, milestones, players, venueSuggestions, venues } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth-utils";
import { slugify } from "@/lib/utils";
import { canPublishPlayer } from "@/lib/domain/privacy";
import type { ActionState } from "./tournaments";

async function log(actorId: string, action: string, entityType: string, entityId: string, summary: string) {
  await db.insert(auditLogs).values({ id: randomUUID(), actorId, action, entityType, entityId, summary });
}
async function cityId() {
  const city = await db.query.cities.findFirst({ where: eq(cities.slug, "bologna") });
  if (!city) throw new Error("Città non configurata.");
  return city.id;
}
function refresh(path: string) { revalidatePath(path); revalidatePath("/"); revalidatePath("/admin/contenuti"); }
function optionalUrl(value: string | undefined) { return !value ? null : z.string().url().parse(value); }

export async function createEventAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(["admin", "editor"]);
  const parsed = z.object({ title: z.string().trim().min(3).max(150), type: z.enum(["tournament","free_play","social","fundraising","workshop"]), startsAt: z.string().datetime({local:true}), endsAt: z.string().optional(), venueId: z.string().optional(), locationText: z.string().max(200).optional(), description: z.string().max(4000).optional(), registrationUrl: z.string().optional(), source: z.string().max(300).optional(), status: z.enum(["draft","published"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Controlla titolo, data e tipologia dell’evento." };
  try {
    const id = randomUUID();
    await db.insert(events).values({ id, cityId: await cityId(), title: parsed.data.title, slug: `${slugify(parsed.data.title)}-${id.slice(0,6)}`, type: parsed.data.type, startsAt: new Date(parsed.data.startsAt).toISOString(), endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt).toISOString() : null, venueId: parsed.data.venueId || null, locationText: parsed.data.locationText || null, description: parsed.data.description || null, registrationUrl: optionalUrl(parsed.data.registrationUrl), source: parsed.data.source || null, status: parsed.data.status });
    await log(user.id, "event.created", "event", id, `${parsed.data.status === "published" ? "Pubblicato" : "Creato"} evento ${parsed.data.title}`);
    refresh("/eventi"); return { success: "Evento salvato." };
  } catch { return { error: "Evento non salvato. Verifica che i link siano URL http/https completi." }; }
}

export async function createVenueAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(["admin", "editor", "reviewer"]);
  const parsed = z.object({ name: z.string().trim().min(2).max(150), address: z.string().max(200).optional(), latitude: z.coerce.number().min(-90).max(90), longitude: z.coerce.number().min(-180).max(180), tableCount: z.coerce.number().int().min(0).optional().or(z.literal("")), indoor: z.enum(["yes","no","unknown"]), access: z.string().max(300).optional(), openingHours: z.string().max(300).optional(), accessibility: z.string().max(500).optional(), description: z.string().max(2000).optional(), verificationStatus: z.enum(["unverified","verified"]), lastVerifiedAt: z.string().optional(), source: z.string().max(300).optional(), status: z.enum(["draft","published"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Controlla nome, coordinate e numero di tavoli." };
  if (parsed.data.verificationStatus === "verified" && !parsed.data.lastVerifiedAt) return { error: "Una sede verificata richiede la data dell’ultima verifica." };
  try {
    const id = randomUUID();
    await db.insert(venues).values({ id, cityId: await cityId(), name: parsed.data.name, slug: `${slugify(parsed.data.name)}-${id.slice(0,6)}`, address: parsed.data.address || null, latitude: parsed.data.latitude, longitude: parsed.data.longitude, tableCount: parsed.data.tableCount === "" || parsed.data.tableCount === undefined ? null : parsed.data.tableCount, indoor: parsed.data.indoor === "unknown" ? null : parsed.data.indoor === "yes", access: parsed.data.access || null, openingHours: parsed.data.openingHours || null, accessibility: parsed.data.accessibility || null, description: parsed.data.description || null, verificationStatus: parsed.data.verificationStatus, lastVerifiedAt: parsed.data.lastVerifiedAt ? new Date(`${parsed.data.lastVerifiedAt}T12:00:00Z`).toISOString() : null, source: parsed.data.source || null, status: parsed.data.status });
    await log(user.id, "venue.created", "venue", id, `${parsed.data.status === "published" ? "Pubblicata" : "Creata"} sede ${parsed.data.name}`);
    refresh("/mappa"); return { success: "Sede salvata." };
  } catch { return { error: "Sede non salvata." }; }
}

export async function createProjectAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(["admin", "editor"]);
  const parsed = z.object({ title: z.string().trim().min(3).max(150), summary: z.string().trim().min(10).max(500), description: z.string().max(4000).optional(), category: z.string().max(80), amount: z.string().optional(), source: z.string().max(300).optional(), verificationStatus: z.enum(["unverified","verified"]), status: z.enum(["draft","published"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Titolo e riepilogo sono obbligatori." };
  const amount = parsed.data.amount ? Number(parsed.data.amount.replace(",",".")) : null;
  if (amount !== null && (!Number.isFinite(amount) || amount < 0)) return { error: "Importo non valido." };
  if (amount !== null && (!parsed.data.source || parsed.data.verificationStatus !== "verified")) return { error: "Per pubblicare un importo servono fonte e stato verificato." };
  const id = randomUUID();
  await db.insert(communityProjects).values({ id, cityId: await cityId(), title: parsed.data.title, slug: `${slugify(parsed.data.title)}-${id.slice(0,6)}`, summary: parsed.data.summary, description: parsed.data.description || null, category: parsed.data.category, fundsRaisedCents: amount === null ? null : Math.round(amount * 100), source: parsed.data.source || null, verificationStatus: parsed.data.verificationStatus, status: parsed.data.status });
  await log(user.id, "project.created", "project", id, `Salvato progetto ${parsed.data.title}`);
  refresh("/progetti"); return { success: "Progetto salvato." };
}

export async function reviewMilestoneAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(["admin", "reviewer"]);
  const id = String(formData.get("id") ?? "");
  const verificationStatus = String(formData.get("verificationStatus") ?? "reported");
  if (!["reported","verified"].includes(verificationStatus)) return { error: "Stato non valido." };
  const milestone = await db.query.milestones.findFirst({ where: eq(milestones.id, id) });
  if (!milestone) return { error: "Milestone non trovata." };
  await db.update(milestones).set({ verificationStatus, updatedAt: new Date().toISOString() }).where(eq(milestones.id, id));
  await log(user.id, "milestone.reviewed", "milestone", id, `${milestone.title}: ${verificationStatus}`);
  refresh("/progetti"); return { success: "Revisione aggiornata." };
}

export async function moderateVenueSuggestionAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(["admin", "reviewer"]);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["approved","rejected"].includes(status)) return { error: "Stato non valido." };
  await db.update(venueSuggestions).set({ status }).where(eq(venueSuggestions.id, id));
  await log(user.id, "venue_suggestion.moderated", "venue_suggestion", id, `Segnalazione ${status}`);
  revalidatePath("/admin/sedi"); return { success: "Moderazione registrata. La sede va inserita separatamente con dati verificati." };
}

export async function createPlayerAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(["admin", "organizer"]);
  const parsed = z.object({ displayName: z.string().trim().min(2).max(80), publicSlug: z.string().trim().regex(/^[a-z0-9-]+$/), bio: z.string().max(1000).optional(), visibility: z.enum(["private","public"]), consent: z.literal("yes").optional(), isMinor: z.literal("yes").optional(), guardianConsent: z.literal("yes").optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Controlla nome e slug (solo lettere minuscole, numeri e trattini)." };
  const now = new Date().toISOString();
  const record = { visibility: parsed.data.visibility, consentAt: parsed.data.consent ? now : null, isMinor: Boolean(parsed.data.isMinor), guardianConsentAt: parsed.data.guardianConsent ? now : null, publicSlug: parsed.data.publicSlug };
  if (!canPublishPlayer(record) && record.visibility === "public") return { error: "Profilo non pubblicabile: consenso mancante; per un minorenne serve anche l’autorizzazione del tutore." };
  try {
    const id = randomUUID();
    await db.insert(players).values({ id, cityId: await cityId(), displayName: parsed.data.displayName, bio: parsed.data.bio || null, ...record });
    await log(user.id, "player.created", "player", id, `Creato profilo ${parsed.data.displayName}: ${parsed.data.visibility}`);
    revalidatePath("/giocatori"); return { success: "Profilo salvato con le scelte privacy indicate." };
  } catch { return { error: "Slug già utilizzato o salvataggio non riuscito." }; }
}
