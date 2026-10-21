"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bike, Plus } from "lucide-react";
import { addRider, updateRider } from "@/app/admin/actions";
import { inr } from "@/lib/money";
import { useApp } from "../AppProvider";
import { BottomSheet } from "../ui/BottomSheet";
import { StatusBadge, field, label } from "./ui";
import type { OrderStatus } from "@/lib/types";

type R = { id: string; name: string; phone: string; vehicle: string; storeId: string; online: boolean; onlineSince?: string; active: { id: string; code: string; status: OrderStatus } | null; today: number; earned: number; cash: number; lastSeen?: string };

const ago = (t?: string) => {
  if (!t) return "never";
  const m = Math.floor((Date.now() - Date.parse(t)) / 60000);
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ago`;
};

export function RiderManager({ riders, stores }: { riders: R[]; stores: { id: string; name: string }[] }) {
  const router = useRouter();
  const { toast } = useApp();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [d, setD] = useState({ phone: "", name: "", vehicle: "", storeId: stores[0].id });
  const [err, setErr] = useState("");
  useEffect(() => { const t = setInterval(() => router.refresh(), 8000); return () => clearInterval(t); }, [router]);
  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) => start(async () => { const r = await fn(); toast(r.ok ? msg : r.error || "Failed"); router.refresh(); });

  return (
    <>
      <div className="mb-3 flex justify-end"><button onClick={() => { setErr(""); setAdding(true); }} className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent"><Plus size={16} /> Add rider</button></div>
      {riders.length === 0 ? <p className="rounded-xl border border-border bg-bg p-10 text-center text-sm text-muted">No riders yet. Add one, then they log in at /rider with their phone.</p> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {riders.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-bg p-4">
              <div className="flex items-start gap-3">
                <span className={`relative grid size-11 place-items-center rounded-full ${r.online ? "bg-success-soft text-success" : "bg-surface text-muted"}`}>
                  <Bike size={20} />{r.online && <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-success" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{r.name}</p>
                  <p className="text-xs text-muted">+91 {r.phone} · {r.vehicle || "no vehicle"} · seen {ago(r.lastSeen)}</p>
                </div>
                <span className={`rounded-pill px-2 py-0.5 text-xs font-bold ${r.online ? "bg-success-soft text-success" : "bg-surface text-muted"}`}>{r.online ? "On duty" : "Off duty"}</span>
              </div>
              {r.active && (
                <Link href={`/admin/orders/${r.active.id}`} className="mt-3 flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                  <span>Delivering <b>#{r.active.code}</b></span><StatusBadge s={r.active.status} />
                </Link>
              )}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-surface py-2"><b className="block text-sm">{r.today}</b>trips today</div>
                <div className="rounded-lg bg-surface py-2"><b className="block text-sm">{inr(r.earned)}</b>earned</div>
                <div className="rounded-lg bg-surface py-2"><b className="block text-sm">{inr(r.cash)}</b>cash held</div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <select aria-label={`Store for ${r.name}`} value={r.storeId} disabled={pending} onChange={(e) => act(() => updateRider(r.id, { storeId: e.target.value }), "Store changed")} className={`${field} h-9 max-w-[200px] flex-1`}>
                  {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {r.online && <button disabled={pending} onClick={() => act(() => updateRider(r.id, { forceOffline: true }), "Set off duty")} className="h-9 rounded-md border border-border px-3 text-xs font-semibold">Set off duty</button>}
                <button disabled={pending} onClick={() => { if (confirm(`Remove ${r.name} as a rider?`)) act(() => updateRider(r.id, { remove: true }), "Rider removed"); }} className="h-9 rounded-md border border-danger px-3 text-xs font-semibold text-danger">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <BottomSheet open={adding} onClose={() => setAdding(false)} title="Add rider">
        <form onSubmit={(e) => { e.preventDefault(); setErr(""); start(async () => { const r = await addRider(d); if (!r.ok) return setErr(r.error); setAdding(false); setD({ ...d, phone: "", name: "", vehicle: "" }); toast("Rider added. They can log in at /rider now."); router.refresh(); }); }} className="grid gap-3 bg-bg p-4">
          <label><span className={label}>Mobile number *</span><input autoFocus inputMode="numeric" className={field} value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} /></label>
          <label><span className={label}>Name *</span><input className={field} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></label>
          <label><span className={label}>Vehicle number</span><input className={`${field} uppercase`} value={d.vehicle} onChange={(e) => setD({ ...d, vehicle: e.target.value })} placeholder="DL 3S AB 1234" /></label>
          <label><span className={label}>Store</span><select className={field} value={d.storeId} onChange={(e) => setD({ ...d, storeId: e.target.value })}>{stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          {err && <p role="alert" className="text-sm font-semibold text-danger">{err}</p>}
          <button disabled={pending} className="h-11 rounded-md bg-accent text-sm font-semibold text-on-accent disabled:opacity-60">{pending ? "Adding…" : "Add rider"}</button>
        </form>
      </BottomSheet>
    </>
  );
}
