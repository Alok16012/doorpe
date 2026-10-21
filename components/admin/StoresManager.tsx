"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { updateStore } from "@/app/admin/actions";
import type { Store } from "@/lib/geo";
import { useApp } from "../AppProvider";
import { Switch } from "./ActiveToggle";
import { Pill, field, label } from "./ui";

type S = Store & { openNow: boolean; ordersToday: number };

function StoreCard({ s }: { s: S }) {
  const router = useRouter();
  const { toast } = useApp();
  const [pending, start] = useTransition();
  const [opensAt, setOpens] = useState(String(s.opensAt));
  const [closesAt, setCloses] = useState(String(s.closesAt));
  const [radius, setRadius] = useState(String(s.radiusKm));
  const save = (patch: Parameters<typeof updateStore>[1]) => start(async () => {
    const r = await updateStore(s.id, patch);
    toast(r.ok ? "Store updated" : r.error);
    router.refresh();
  });
  return (
    <li className="rounded-xl border border-border bg-bg p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-brand/40"><MapPin size={18} /></span>
        <div className="flex-1">
          <p className="font-bold">{s.name} <span className="font-normal text-muted">· {s.city}</span></p>
          <p className="text-xs text-muted">{s.ordersToday} orders today · {s.lat.toFixed(3)}, {s.lng.toFixed(3)}</p>
        </div>
        <Pill on={s.openNow}>{s.openNow ? "Taking orders" : s.isOpen === false ? "Paused" : "Closed (hours)"}</Pill>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-surface px-3 py-2">
        <span className="text-sm font-semibold">Accept orders</span>
        <Switch on={s.isOpen !== false} disabled={pending} onChange={(v) => save({ isOpen: v })} label={`Accept orders at ${s.name}`} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); save({ opensAt: Number(opensAt), closesAt: Number(closesAt), radiusKm: Number(radius) }); }} className="mt-3 grid grid-cols-3 items-end gap-2">
        <label><span className={label}>Opens (hour)</span><input className={field} inputMode="numeric" value={opensAt} onChange={(e) => setOpens(e.target.value.replace(/\D/g, ""))} /></label>
        <label><span className={label}>Closes (hour)</span><input className={field} inputMode="numeric" value={closesAt} onChange={(e) => setCloses(e.target.value.replace(/\D/g, ""))} /></label>
        <label><span className={label}>Radius (km)</span><input className={field} inputMode="decimal" value={radius} onChange={(e) => setRadius(e.target.value.replace(/[^\d.]/g, ""))} /></label>
        <button disabled={pending} className="col-span-3 h-9 rounded-md border border-accent text-sm font-semibold text-accent hover:bg-accent-soft disabled:opacity-50">Save hours & radius</button>
      </form>
      <p className="mt-2 text-xs text-muted">Hours are IST, 0–24. 0 to 24 means open all night.</p>
    </li>
  );
}

export function StoresManager({ stores }: { stores: S[] }) {
  return <ul className="grid gap-3 md:grid-cols-2">{stores.map((s) => <StoreCard key={s.id} s={s} />)}</ul>;
}
