export function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("it-IT", options ?? { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" }).format(new Date(value));
}

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const tournamentStatus: Record<string, string> = {
  draft: "Bozza",
  upcoming: "In arrivo",
  ongoing: "In corso",
  completed: "Concluso",
};

export const formatLabels: Record<string, string> = {
  single_elimination: "Eliminazione diretta",
  round_robin: "Girone all’italiana",
};

export const eventTypeLabels: Record<string, string> = {
  tournament: "Torneo",
  free_play: "Gioco libero",
  social: "Incontro",
  fundraising: "Raccolta fondi",
  workshop: "Laboratorio",
};

export function safeExternalUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}
