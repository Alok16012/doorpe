"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type * as L from "leaflet";

type Pt = { lat: number; lng: number };
const pin = (emoji: string, bg: string) =>
  `<div style="display:grid;place-items:center;width:38px;height:38px;border-radius:999px;background:${bg};border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.25);font-size:18px">${emoji}</div>`;

/** OpenStreetMap via Leaflet. Store, home and (optional) rider markers; or a draggable pin for picking. */
export function LiveMap({
  store, home, rider, pick, onPick, className = "h-64",
}: { store?: Pt; home?: Pt; rider?: Pt | null; pick?: Pt; onPick?: (p: Pt) => void; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const lib = useRef<typeof L | null>(null);
  const riderM = useRef<L.Marker | null>(null);
  const pickM = useRef<L.Marker | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    let dead = false;
    (async () => {
      const Lmod = (await import("leaflet")).default;
      if (dead || !el.current || map.current) return;
      lib.current = Lmod;
      const m = Lmod.map(el.current, { zoomControl: false, attributionControl: true });
      Lmod.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(m);
      Lmod.control.zoom({ position: "bottomright" }).addTo(m);
      map.current = m;
      // the map often mounts inside an animating sheet; re-measure once it settles and on any resize
      const ro = new ResizeObserver(() => m.invalidateSize());
      ro.observe(el.current);
      setTimeout(() => m.invalidateSize(), 300);
      m.once("unload", () => ro.disconnect());
      const pts: Pt[] = [];
      if (store) { Lmod.marker([store.lat, store.lng], { icon: Lmod.divIcon({ html: pin("🏪", "var(--color-brand)"), className: "", iconSize: [38, 38], iconAnchor: [19, 19] }), title: "Store" }).addTo(m); pts.push(store); }
      if (home) { Lmod.marker([home.lat, home.lng], { icon: Lmod.divIcon({ html: pin("🏠", "var(--color-accent)"), className: "", iconSize: [38, 38], iconAnchor: [19, 19] }), title: "You" }).addTo(m); pts.push(home); }
      if (store && home) Lmod.polyline([[store.lat, store.lng], [home.lat, home.lng]], { color: "#2f6fd1", weight: 3, dashArray: "6 8", opacity: 0.7 }).addTo(m);
      if (pick) {
        const pm = Lmod.marker([pick.lat, pick.lng], { draggable: true, icon: Lmod.divIcon({ html: pin("📍", "#fff"), className: "", iconSize: [38, 38], iconAnchor: [19, 36] }), title: "Delivery spot" }).addTo(m);
        pm.on("dragend", () => { const p = pm.getLatLng(); onPickRef.current?.({ lat: p.lat, lng: p.lng }); });
        m.on("click", (e: L.LeafletMouseEvent) => { pm.setLatLng(e.latlng); onPickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }); });
        pickM.current = pm;
        m.setView([pick.lat, pick.lng], 17);
      } else if (pts.length > 1) m.fitBounds(Lmod.latLngBounds(pts.map((p) => [p.lat, p.lng])), { padding: [40, 40] });
      else if (pts.length) m.setView([pts[0].lat, pts[0].lng], 15);
    })();
    return () => { dead = true; map.current?.remove(); map.current = null; riderM.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const Lmod = lib.current, m = map.current;
    if (!Lmod || !m) return;
    if (!rider) { riderM.current?.remove(); riderM.current = null; return; }
    if (!riderM.current) riderM.current = Lmod.marker([rider.lat, rider.lng], { icon: Lmod.divIcon({ html: pin("🛵", "var(--color-success)"), className: "", iconSize: [38, 38], iconAnchor: [19, 19] }), title: "Rider", zIndexOffset: 1000 }).addTo(m);
    else riderM.current.setLatLng([rider.lat, rider.lng]);
  }, [rider?.lat, rider?.lng, rider]);

  return <div ref={el} className={`z-0 w-full overflow-hidden ${className}`} role="img" aria-label="Map" />;
}
