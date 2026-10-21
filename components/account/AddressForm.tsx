"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Briefcase, Home, MapPin, TriangleAlert } from "lucide-react";
import { Button } from "../ui/Button";
import type { Address } from "@/lib/types";

const LiveMap = dynamic(() => import("../ui/LiveMap").then((m) => m.LiveMap), { ssr: false, loading: () => <div className="skeleton h-56 w-full" /> });

type Draft = Omit<Address, "id" | "userId" | "createdAt" | "isDefault"> & { isDefault?: boolean };

export function AddressForm({ initial, onSaved, defaultName, defaultPhone, editingId }: {
  initial: { lat: number; lng: number; area: string; city: string } & Partial<Draft>;
  onSaved: (a: Address) => void; defaultName?: string; defaultPhone?: string; editingId?: string;
}) {
  const [d, setD] = useState<Draft>({
    label: "home", houseNo: "", floor: "", building: "", landmark: "", receiverName: defaultName || "", receiverPhone: defaultPhone || "",
    ...initial,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  async function onPick(p: { lat: number; lng: number }) {
    setLocating(true);
    set("lat", p.lat); set("lng", p.lng);
    try {
      const r = await fetch(`/api/geo/reverse?lat=${p.lat}&lng=${p.lng}`);
      const g = await r.json();
      setD((x) => ({ ...x, lat: p.lat, lng: p.lng, area: [g.label, g.sub].filter(Boolean).join(", "), city: g.sub?.split(", ").slice(-2, -1)[0] || x.city }));
    } finally { setLocating(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const r = await fetch(editingId ? `/api/addresses/${editingId}` : "/api/addresses", { method: editingId ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(d) });
      const j = await r.json();
      if (!r.ok) return setError(j.error);
      onSaved(j.address);
    } catch { setError("Couldn't save. Check your connection."); } finally { setBusy(false); }
  }

  const field = "h-11 w-full rounded-md border border-input bg-bg px-3 text-sm font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";
  return (
    <form onSubmit={save} className="bg-bg">
      <div className="relative">
        <LiveMap pick={{ lat: d.lat, lng: d.lng }} onPick={onPick} className="h-56" />
        <p className="pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-pill bg-text/85 px-3 py-1 text-xs font-semibold text-bg">Drag the pin to your exact door</p>
      </div>
      <div className="space-y-3 p-4">
        <p className="flex items-start gap-2 rounded-md bg-surface p-3 text-sm">
          <MapPin size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <span className={locating ? "opacity-50" : ""}>{d.area || "Pick a point on the map"}</span>
        </p>
        <fieldset>
          <legend className="mb-2 text-xs font-bold text-muted">Save as</legend>
          <div className="flex gap-2">
            {([["home", Home, "Home"], ["work", Briefcase, "Work"], ["other", MapPin, "Other"]] as const).map(([k, I, t]) => (
              <label key={k} className={`flex cursor-pointer items-center gap-1.5 rounded-pill border px-3 py-1.5 text-sm font-bold ${d.label === k ? "border-accent bg-accent-soft text-accent" : "border-border"}`}>
                <input type="radio" name="label" value={k} checked={d.label === k} onChange={() => set("label", k)} className="sr-only" /><I size={14} /> {t}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block"><span className="mb-1 block text-xs font-bold text-muted">Flat / house no. *</span><input required className={field} value={d.houseNo} onChange={(e) => set("houseNo", e.target.value)} autoComplete="address-line1" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-xs font-bold text-muted">Floor</span><input className={field} value={d.floor} onChange={(e) => set("floor", e.target.value)} /></label>
          <label className="block"><span className="mb-1 block text-xs font-bold text-muted">Building / society</span><input className={field} value={d.building} onChange={(e) => set("building", e.target.value)} /></label>
        </div>
        <label className="block"><span className="mb-1 block text-xs font-bold text-muted">Nearby landmark</span><input className={field} value={d.landmark} onChange={(e) => set("landmark", e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-xs font-bold text-muted">Receiver&apos;s name *</span><input required className={field} value={d.receiverName} onChange={(e) => set("receiverName", e.target.value)} autoComplete="name" /></label>
          <label className="block"><span className="mb-1 block text-xs font-bold text-muted">Receiver&apos;s phone *</span><input required inputMode="numeric" className={field} value={d.receiverPhone} onChange={(e) => set("receiverPhone", e.target.value.replace(/\D/g, "").slice(0, 10))} autoComplete="tel-national" /></label>
        </div>
        {error && <p role="alert" className="flex items-center gap-1.5 text-sm font-semibold text-danger"><TriangleAlert size={14} />{error}</p>}
        <Button type="submit" size="lg" block loading={busy}>Save address</Button>
      </div>
    </form>
  );
}
