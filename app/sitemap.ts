import type { MetadataRoute } from "next";
import { getPublicEvents, getPublicPlayers, getPublicTournaments } from "@/lib/data/public";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [tournaments,events,players] = await Promise.all([getPublicTournaments(),getPublicEvents(),getPublicPlayers()]);
  return [
    ...["","/tornei","/giocatori","/classifiche","/statistiche","/mappa","/eventi","/progetti"].map((path) => ({ url: `${base}${path}`, changeFrequency: path === "" ? "daily" as const : "weekly" as const })),
    ...tournaments.map((item) => ({ url: `${base}/tornei/${item.slug}`, lastModified: item.updatedAt })),
    ...events.map((item) => ({ url: `${base}/eventi/${item.slug}`, lastModified: item.updatedAt })),
    ...players.map((item) => ({ url: `${base}/giocatori/${item.publicSlug}`, lastModified: item.updatedAt })),
  ];
}
