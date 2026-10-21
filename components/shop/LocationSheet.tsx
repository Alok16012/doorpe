"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crosshair, Loader2, MapPin, Search, TriangleAlert } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";

type Spot = { label: string; sub: string; lat: number; lng: number };
const POPULAR: Spot[] = [
  { label: "Connaught Place", sub: "New Delhi, Delhi", lat: 28.6328, lng: 77.2197 },
  { label: "DLF Cyber City", sub: "Gurugram, Haryana", lat: 28.4947, lng: 77.0886 },
  { label: "Andheri West", sub: "Mumbai, Maharashtra", lat: 19.1355, lng: 72.8264 },
  { label: "Koramangala 5th Block", sub: "Bengaluru, Karnataka", lat: 12.9345, lng: 77.6191 },
];

export function LocationSheet({ open, onClose, hasLocation, autoGps = false }: { open: boolean; onClose: () => void; hasLocation: boolean; autoGps?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Spot[]>([]);
  const [busy, setBusy] = useState(false);
  const [gps, setGps] = useState<"idle" | "busy" | "denied">("idle");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) { setQ(""); setResults([]); setError(""); setGps("idle"); }
    else if (autoGps) locateMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoGps]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 3) { setResults([]); setBusy(false); return; }
    setBusy(true);
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/geo/search?q=${encodeURIComponent(term)}`, { signal: ctl.signal });
        const d = await r.json();
        if (!r.ok) setError(d.error || "Search failed");
        else { setError(""); setResults(d.results); }
      } catch {} finally { setBusy(false); }
    }, 400);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);

  async function choose(s: Spot) {
    setSaving(true);
    try {
      await fetch("/api/location", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(s) });
      onClose();
      router.refresh();
    } finally { setSaving(false); }
  }

  function locateMe() {
    if (!navigator.geolocation) { setGps("denied"); return; }
    setGps("busy");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const r = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`);
          await choose(await r.json());
        } finally { setGps("idle"); }
      },
      () => setGps("denied"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={hasLocation ? "Change Location" : "Select your Location"}>
      <div className="space-y-3 p-4">
        <label className="flex h-12 items-center gap-2 rounded-lg border border-border bg-bg px-3 focus-within:border-text">
          <Search size={18} className="text-muted" aria-hidden />
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search delivery location"
            aria-label="Search delivery location"
            className="h-full flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-faint"
          />
          {busy && <Loader2 size={16} className="animate-spin text-muted" aria-label="Searching" />}
        </label>

        <button onClick={locateMe} disabled={gps === "busy" || saving} className="flex w-full items-center gap-3 rounded-lg bg-bg px-3 py-3.5 text-left text-sm font-semibold text-accent disabled:opacity-60">
          {gps === "busy" ? <Loader2 size={18} className="animate-spin" /> : <Crosshair size={18} />}
          <span>Use current location</span>
        </button>
        {gps === "denied" && (
          <p className="flex items-start gap-2 rounded-md bg-bg px-3 py-2 text-xs text-warning">
            <TriangleAlert size={14} className="mt-0.5 shrink-0" /> Location access is off. Allow it in your browser settings, or search for your area above.
          </p>
        )}
        {error && <p className="px-1 text-xs font-semibold text-danger">{error}</p>}
      </div>

      <div className="bg-bg">
        {(q.trim().length >= 3 ? results : POPULAR).length > 0 && (
          <p className="px-4 pt-4 text-xs font-bold uppercase tracking-wide text-muted">{q.trim().length >= 3 ? "Results" : "Popular areas we serve"}</p>
        )}
        <ul className="divide-y divide-border">
          {(q.trim().length >= 3 ? results : POPULAR).map((s) => (
            <li key={`${s.lat},${s.lng}`}>
              <button disabled={saving} onClick={() => choose(s)} className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-surface disabled:opacity-60">
                <MapPin size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{s.label}</span>
                  <span className="block truncate text-xs text-muted">{s.sub}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {q.trim().length >= 3 && !busy && !results.length && !error && (
          <p className="px-4 py-8 text-center text-sm text-muted">No places found for “{q}”. Try a nearby landmark.</p>
        )}
      </div>
    </BottomSheet>
  );
}
