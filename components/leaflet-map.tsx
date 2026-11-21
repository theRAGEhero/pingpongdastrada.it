"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Venue } from "@/lib/db/schema";

export default function LeafletMap({ venues, compact }: { venues: Venue[]; compact: boolean }) {
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!element.current || venues.length === 0) return;
    const map = L.map(element.current, { scrollWheelZoom: false, zoomControl: !compact }).setView([44.4949, 11.3426], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
      maxZoom: 19,
    }).addTo(map);
    const points: L.LatLngExpression[] = [];
    for (const venue of venues) {
      const point: L.LatLngExpression = [venue.latitude, venue.longitude];
      points.push(point);
      const popup = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = venue.name;
      const text = document.createElement("div");
      text.textContent = venue.verificationStatus === "verified" ? "Sede verificata" : "Informazioni in verifica";
      popup.append(title, text);
      L.marker(point, {
        icon: L.divIcon({ className: "", html: "<span class=\"venue-pin\"></span>", iconSize: [30, 30], iconAnchor: [15, 28] }),
        title: venue.name,
      }).addTo(map).bindPopup(popup);
    }
    if (points.length === 1) map.setView(points[0], 15);
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points).pad(0.15));
    setTimeout(() => map.invalidateSize(), 0);
    return () => { map.remove(); };
  }, [venues, compact]);

  if (venues.length === 0) {
    return <div className="map-fallback"><div><strong>La mappa è pronta, i luoghi no.</strong><p className="muted">Le sedi appariranno dopo la verifica delle informazioni.</p></div></div>;
  }
  return <div ref={element} className="map-canvas" role="region" aria-label={`Mappa OpenStreetMap con ${venues.length} luoghi`} />;
}
