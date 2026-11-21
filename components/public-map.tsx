"use client";

import dynamic from "next/dynamic";
import type { Venue } from "@/lib/db/schema";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <div className="map-fallback">Caricamento della mappa…</div>,
});

export function PublicMap({ venues, compact = false }: { venues: Venue[]; compact?: boolean }) {
  return <LeafletMap venues={venues} compact={compact} />;
}
