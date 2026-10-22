"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Banknote, Check, CircleAlert, Clock, MapPin, Navigation, Package, Phone, Store, Wifi, WifiOff } from "lucide-react";
import { inr } from "@/lib/money";
import { useApp } from "../AppProvider";
import { ProductArt } from "../shop/ProductArt";
import { SlideToConfirm } from "./SlideToConfirm";
import { useRiderLocation } from "./useRiderLocation";

const LiveMap = dynamic(() => import("../ui/LiveMap").then((m) => m.LiveMap), { ssr: false, loading: () => <div className="skeleton h-48 w-full" /> });

type State = {
  me: { id: string; name: string; phone: string; vehicle: string; online: boolean; onlineSince?: string };
  store: { id: string; name: string; city: string; lat: number; lng: number } | null;
  active: null | {
    id: string; code: string; status: string; stage?: "to_store" | "at_store" | "to_customer" | "at_customer";
    items: { variantId: string; name: string; unit: string; icon: string; qty: number }[];
    address: { houseNo: string; floor?: string; building?: string; landmark?: string; area: string; lat: number; lng: number; receiverName: string; receiverPhone: string };
    instructions?: string; paymentMethod: string; cod: number; pay: number; tip: number; km: number; storeReady: boolean;
  };
  offers: { id: string; code: string; items: number; km: number; pay: number; cod: number; area: string; status: string; placedMinsAgo: number; tip: number }[];
  today: { deliveries: number; earnings: number; tips: number };
  location: { lat: number; lng: number; at: string } | null;
};

const mapsUrl = (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=two_wheeler`;
const post = (url: string, body?: unknown) => fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body ?? {}) }).then(async (r) => ({ ok: r.ok, ...(await r.json()) }));

export function RiderHome() {
  const { toast } = useApp();
  const [s, setS] = useState<State | null>(null);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ pay: number; code: string } | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const lastActive = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/rider/state");
      const d = await r.json();
      if (!r.ok) return setErr(d.error);
      setErr("");
      // buzz for brand-new offers
      const fresh = (d as State).offers.filter((o) => !seen.current.has(o.id));
      if (seen.current.size && fresh.length) { navigator.vibrate?.([200, 100, 200]); toast(`New order nearby · ${inr(fresh[0].pay)}`); }
      (d as State).offers.forEach((o) => seen.current.add(o.id));
      if (lastActive.current && !d.active && !done) toast("Your order was cancelled or closed by the store");
      lastActive.current = d.active?.id ?? null;
      setS(d);
    } catch { setErr("You're offline. Retrying…"); }
  }, [toast, done]);

  useEffect(() => { load(); const t = setInterval(load, 4000); return () => clearInterval(t); }, [load]);
  const gps = useRiderLocation(!!s?.me.online || !!s?.active);

  async function toggleOnline() {
    if (!s) return;
    const r = await post("/api/rider/online", { online: !s.me.online });
    if (!r.ok) return toast(r.error);
    load();
  }
  async function accept(id: string) {
    const r = await post(`/api/rider/orders/${id}/accept`);
    if (!r.ok) { toast(r.error); return load(); }
    navigator.vibrate?.(80);
    load();
  }
  async function step(step: string, extra?: Record<string, unknown>) {
    if (!s?.active) return;
    const id = s.active.id, pay = s.active.pay, code = s.active.code;
    const r = await post(`/api/rider/orders/${id}/step`, { step, ...extra });
    if (!r.ok) { toast(r.error); return; }
    if (step === "deliver") { lastActive.current = null; setDone({ pay, code }); }
    load();
  }

  if (!s) return <div className="space-y-3 p-4">{err ? <p className="text-sm text-danger">{err}</p> : [0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>;

  return (
    <>
      <header style={{ paddingTop: "calc(16px + env(safe-area-inset-top))" }} className={`sticky top-0 z-30 px-4 pb-4 text-on-accent ${s.me.online ? "bg-accent" : "bg-muted"}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold">Hi, {s.me.name.split(" ")[0]}</p>
            <p className="flex items-center gap-1 text-xs opacity-90"><Store size={12} /> {s.store ? `${s.store.name}, ${s.store.city}` : "No store assigned"}</p>
          </div>
          <button onClick={toggleOnline} role="switch" aria-checked={s.me.online} aria-label="On duty"
            className={`flex h-10 items-center gap-2 rounded-pill px-4 text-sm font-bold ${s.me.online ? "bg-white text-accent" : "bg-white/15 text-white ring-1 ring-white/40"}`}>
            {s.me.online ? <Wifi size={16} /> : <WifiOff size={16} />}{s.me.online ? "On duty" : "Off duty"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white/15 py-2"><p className="text-lg font-extrabold tabular-nums">{s.today.deliveries}</p><p className="text-[11px] opacity-90">Deliveries</p></div>
          <div className="rounded-lg bg-white/15 py-2"><p className="text-lg font-extrabold tabular-nums">{inr(s.today.earnings)}</p><p className="text-[11px] opacity-90">Earned today</p></div>
          <div className="rounded-lg bg-white/15 py-2"><p className="text-lg font-extrabold tabular-nums">{inr(s.today.tips)}</p><p className="text-[11px] opacity-90">Tips</p></div>
        </div>
      </header>

      {err && <p className="mx-4 mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">{err}</p>}
      {(s.me.online || s.active) && (gps === "denied" || gps === "unsupported") && (
        <p className="mx-4 mt-3 flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2 text-xs font-semibold text-warning">
          <CircleAlert size={14} className="mt-0.5 shrink-0" /> Location is off. Turn it on so customers can see you coming.
        </p>
      )}

      {done && (
        <div className="m-4 rounded-xl bg-bg p-6 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success"><Check size={32} strokeWidth={3} /></span>
          <p className="mt-3 text-xl font-extrabold">Delivered #{done.code}</p>
          <p className="mt-1 text-sm text-muted">You earned <b className="text-text">{inr(done.pay)}</b> on this trip</p>
          <button onClick={() => setDone(null)} className="mt-5 h-11 w-full rounded-lg bg-accent font-semibold text-on-accent">Back to orders</button>
        </div>
      )}

      {!done && s.active && <ActiveJob a={s.active} store={s.store!} rider={s.location} onStep={step} />}

      {!done && !s.active && (
        <section className="p-4">
          {!s.me.online ? (
            <div className="rounded-xl bg-bg p-8 text-center">
              <WifiOff className="mx-auto text-muted" size={36} />
              <p className="mt-3 font-bold">You&apos;re off duty</p>
              <p className="mt-1 text-sm text-muted">Go on duty to start getting orders from {s.store?.name ?? "your store"}.</p>
              <button onClick={toggleOnline} className="mt-5 h-12 w-full rounded-lg bg-accent font-bold text-on-accent">Go on duty</button>
            </div>
          ) : s.offers.length === 0 ? (
            <div className="rounded-xl bg-bg p-8 text-center">
              <span className="relative mx-auto block size-14"><span className="absolute inset-0 animate-ping rounded-full bg-accent/30" /><span className="absolute inset-2 grid place-items-center rounded-full bg-accent text-on-accent"><Package size={20} /></span></span>
              <p className="mt-4 font-bold">Waiting for orders</p>
              <p className="mt-1 text-sm text-muted">Stay near the store. New orders show up here and your phone buzzes.</p>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-sm font-bold text-muted">{s.offers.length} order{s.offers.length > 1 ? "s" : ""} waiting</h2>
              <ul className="space-y-3">
                {s.offers.map((o) => (
                  <li key={o.id} className="rounded-xl bg-bg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-2xl font-extrabold tabular-nums">{inr(o.pay)}</p>
                        <p className="text-xs text-muted">{o.tip > 0 ? `includes ${inr(o.tip)} tip` : "trip pay"}</p>
                      </div>
                      <span className={`rounded-pill px-2 py-0.5 text-xs font-bold ${o.status === "packed" ? "bg-success-soft text-success" : "bg-info-soft text-info"}`}>{o.status === "packed" ? "Ready to pick up" : "Being packed"}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <span className="flex items-center gap-1"><Navigation size={14} className="text-muted" /> {o.km} km</span>
                      <span className="flex items-center gap-1"><Package size={14} className="text-muted" /> {o.items} items</span>
                      <span className="flex items-center gap-1"><Clock size={14} className="text-muted" /> {o.placedMinsAgo} min ago</span>
                    </div>
                    <p className="mt-2 flex items-start gap-1 text-sm text-muted"><MapPin size={14} className="mt-0.5 shrink-0" /> {o.area}</p>
                    {o.cod > 0 && <p className="mt-2 flex items-center gap-1.5 rounded-md bg-warn-soft px-2 py-1 text-xs font-bold text-warning"><Banknote size={14} /> Collect {inr(o.cod)} cash</p>}
                    <button onClick={() => accept(o.id)} className="mt-3 h-12 w-full rounded-lg bg-accent text-base font-bold text-on-accent">Accept #{o.code}</button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </>
  );
}

function ActiveJob({ a, store, rider, onStep }: { a: NonNullable<State["active"]>; store: NonNullable<State["store"]>; rider: State["location"]; onStep: (s: string, extra?: Record<string, unknown>) => Promise<void> }) {
  const [otp, setOtp] = useState("");
  const [cash, setCash] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const stage = a.stage ?? "to_store";
  const steps = ["Go to store", "Pick up", "Deliver"];
  const idx = stage === "to_store" ? 0 : stage === "at_store" ? 1 : 2;
  const toCustomer = stage === "to_customer" || stage === "at_customer";
  const dest = toCustomer ? { lat: a.address.lat, lng: a.address.lng } : { lat: store.lat, lng: store.lng };
  const addr = [a.address.houseNo, a.address.floor && `Floor ${a.address.floor}`, a.address.building, a.address.landmark, a.address.area].filter(Boolean).join(", ");
  return (
    <section className="space-y-3 p-4">
      <ol className="flex items-center gap-2" aria-label="Delivery steps">
        {steps.map((t, i) => (
          <li key={t} className="flex flex-1 items-center gap-2">
            <span className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${i < idx ? "bg-success text-white" : i === idx ? "bg-accent text-white" : "bg-border text-muted"}`}>{i < idx ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
            <span className={`text-xs font-semibold ${i === idx ? "text-text" : "text-muted"}`}>{t}</span>
          </li>
        ))}
      </ol>

      <div className="overflow-hidden rounded-xl bg-bg">
        <LiveMap store={{ lat: store.lat, lng: store.lng }} home={{ lat: a.address.lat, lng: a.address.lng }} rider={rider ? { lat: rider.lat, lng: rider.lng } : null} className="h-48" />
        <a href={mapsUrl(dest.lat, dest.lng)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 border-t border-border py-3 text-sm font-bold text-accent">
          <Navigation size={16} /> Navigate to {toCustomer ? "customer" : "store"}
        </a>
      </div>

      {!toCustomer ? (
        <div className="rounded-xl bg-bg p-4">
          <p className="text-xs font-semibold text-muted">PICK UP FROM</p>
          <p className="mt-0.5 font-bold">{store.name} store, {store.city}</p>
          <p className="mt-1 text-sm text-muted">Order #{a.code} · {a.items.reduce((n, i) => n + i.qty, 0)} items · {a.km} km trip</p>
          {stage === "at_store" && (
            <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
              {a.items.map((it) => (
                <li key={it.variantId}>
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={!!checked[it.variantId]} onChange={(e) => setChecked((c) => ({ ...c, [it.variantId]: e.target.checked }))} className="size-5 accent-[var(--color-accent)]" />
                    <span className="w-8 shrink-0"><ProductArt label={it.name} icon={it.icon} size="sm" className="!p-0" /></span>
                    <span className="flex-1">{it.name} <span className="text-muted">· {it.unit}</span></span>
                    <b className="tabular-nums">×{it.qty}</b>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-bg p-4">
          <p className="text-xs font-semibold text-muted">DELIVER TO</p>
          <div className="mt-0.5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold">{a.address.receiverName}</p>
              <p className="mt-0.5 text-sm text-muted">{addr}</p>
            </div>
            <a href={`tel:+91${a.address.receiverPhone}`} aria-label={`Call ${a.address.receiverName}`} className="grid size-11 shrink-0 place-items-center rounded-full bg-success-soft text-success"><Phone size={20} /></a>
          </div>
          {a.instructions && <p className="mt-2 rounded-md bg-warn-soft px-2 py-1.5 text-xs font-semibold text-warning">Note: {a.instructions}</p>}
          {a.cod > 0 && <p className="mt-2 flex items-center gap-1.5 rounded-md bg-warn-soft px-2 py-1.5 text-sm font-bold text-warning"><Banknote size={16} /> Collect {inr(a.cod)} in cash or UPI</p>}
        </div>
      )}

      <div className="rounded-xl bg-bg p-4">
        {stage === "to_store" && <SlideToConfirm label="Reached the store" onConfirm={() => onStep("at_store")} />}
        {stage === "at_store" && (a.storeReady
          ? <SlideToConfirm label="Picked up the order" onConfirm={() => onStep("picked_up")} />
          : <p className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-muted"><span className="size-2 animate-pulse rounded-full bg-info" /> Store is packing. This updates by itself.</p>)}
        {stage === "to_customer" && <SlideToConfirm label="Reached the customer" onConfirm={() => onStep("at_customer")} />}
        {stage === "at_customer" && (
          <form onSubmit={(e) => { e.preventDefault(); onStep("deliver", { otp, cashCollected: cash }); }} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Ask the customer for their 4-digit code</span>
              <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="one-time-code" aria-label="Delivery code"
                className="h-14 w-full rounded-lg border border-input text-center text-2xl font-extrabold tracking-[0.6em] outline-none focus:border-accent" />
            </label>
            {a.cod > 0 && (
              <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-semibold">
                <input type="checkbox" checked={cash} onChange={(e) => setCash(e.target.checked)} className="size-5 accent-[var(--color-accent)]" />
                I&apos;ve collected {inr(a.cod)}
              </label>
            )}
            <button disabled={otp.length !== 4 || (a.cod > 0 && !cash)} className="h-14 w-full rounded-lg bg-accent text-base font-bold text-on-accent disabled:bg-switch-off">Complete delivery</button>
          </form>
        )}
      </div>
      <p className="text-center text-xs text-muted">This trip pays {inr(a.pay)}{a.tip ? ` (with ${inr(a.tip)} tip)` : ""}</p>
    </section>
  );
}
