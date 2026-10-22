"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Camera, Check, CircleHelp, KeyRound, Phone, RotateCcw, Star, X } from "lucide-react";
import { TitleBar } from "../ui/TitleBar";
import { Button } from "../ui/Button";
import { BottomSheet } from "../ui/BottomSheet";
import { BillDetails } from "../cart/BillDetails";
import { ProductArt } from "../shop/ProductArt";
import { useApp } from "../AppProvider";
import { cart } from "../cart/store";
import type { LiveOrder } from "@/lib/orders";
import type { Issue } from "@/lib/types";
import { inr } from "@/lib/money";

const LiveMap = dynamic(() => import("../ui/LiveMap").then((m) => m.LiveMap), { ssr: false, loading: () => <div className="skeleton h-64 w-full" /> });

const STEPS = [
  { key: "placed", label: "Order placed", hint: "The store has your order." },
  { key: "packing", label: "Packing your items", hint: "Someone is picking your items off the shelf." },
  { key: "packed", label: "Packed", hint: "Bagged and waiting for your rider." },
  { key: "out_for_delivery", label: "On the way", hint: "Your rider has left the store." },
  { key: "delivered", label: "Delivered", hint: "Handed over. Enjoy!" },
];
const CANCEL_REASONS = ["Ordered by mistake", "Want to change items", "Delivery is taking too long", "Found it cheaper elsewhere", "Other"];
const ISSUE_KINDS: { key: Issue["kind"]; label: string; needsItem: boolean }[] = [
  { key: "missing", label: "An item is missing", needsItem: true },
  { key: "damaged", label: "Item is damaged or leaking", needsItem: true },
  { key: "wrong", label: "I got the wrong item", needsItem: true },
  { key: "quality", label: "Quality isn't good / expired", needsItem: true },
  { key: "late", label: "Delivery was very late", needsItem: false },
  { key: "other", label: "Something else", needsItem: false },
];

export function OrderScreen({ initial, justPlaced }: { initial: LiveOrder; justPlaced: boolean }) {
  const { toast, user } = useApp();
  const [o, setO] = useState(initial);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const final = o.status === "delivered" || o.status === "cancelled";

  useEffect(() => {
    if (final) return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/orders/${o.id}`);
        if (r.ok) setO((await r.json()).order);
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [o.id, final]);

  useEffect(() => {
    if (o.status === "delivered") fetch(`/api/orders/${o.id}/issues`).then((r) => r.json()).then((d) => setIssues(d.issues || []));
  }, [o.id, o.status]);

  const head =
    o.status === "cancelled" ? { bg: "bg-surface", title: "Order cancelled", sub: o.cancelReason || "" }
    : o.status === "delivered" ? { bg: "bg-success text-on-accent", title: "Delivered", sub: `Arrived at ${new Date(o.deliveredAt || Date.now()).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` }
    : { bg: "bg-accent text-on-accent", title: o.live.riderStage === "at_customer" ? "Your rider is here" : `Arriving in ${o.live.minutesLeft} min${o.live.minutesLeft > 1 ? "s" : ""}`, sub: o.live.searching ? "Packed and waiting for a rider" : o.live.riderStage === "at_customer" ? `Share code ${o.deliveryOtp} with ${o.rider.name}` : STEPS[o.live.stepIndex]?.hint };

  function reorder() {
    for (const it of o.items) {
      const line = { variantId: it.variantId, price: it.price, mrp: it.mrp, name: it.name, unit: it.unit, icon: it.icon, tint: it.tint, slug: it.productSlug, max: 10 };
      for (let i = cart.qty(it.variantId); i < it.qty; i++) cart.add(line);
    }
    toast("Items added to your cart");
  }

  return (
    <div className="min-h-dvh bg-surface pb-10">
      <TitleBar title={`Order #${o.code}`} back="/account/orders" right={<button onClick={() => setHelpOpen(true)} className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-bold text-accent hover:bg-accent-soft"><CircleHelp size={16} /> Help</button>} />
      <div className={`${head.bg} px-4 py-5 text-center`}>
        {justPlaced && !final && <p className="mb-1 inline-flex items-center gap-1 rounded-pill bg-bg/70 px-2 py-0.5 text-xs font-extrabold text-text"><Check size={12} strokeWidth={4} /> Order confirmed</p>}
        <p className="text-2xl font-extrabold" aria-live="polite">{head.title}</p>
        {head.sub && <p className="mt-0.5 text-sm font-semibold opacity-80">{head.sub}</p>}
      </div>

      <div className="mx-auto max-w-3xl space-y-3 p-3">
        {o.status !== "cancelled" && (
          <div className="overflow-hidden rounded-xl bg-bg">
            <LiveMap store={o.live.store} home={{ lat: o.address.lat, lng: o.address.lng }} rider={o.live.rider} className="h-64" />
          </div>
        )}

        {!final && (
          <section className="grid gap-3 md:grid-cols-2">
            {o.live.searching ? (
              <div className="flex items-center gap-3 rounded-xl bg-bg p-4">
                <span className="relative grid size-11 place-items-center"><span className="absolute inset-0 animate-ping rounded-full bg-accent/25" /><span className="relative text-2xl" aria-hidden>🛵</span></span>
                <div className="flex-1">
                  <p className="text-sm font-bold">Finding a delivery partner</p>
                  <p className="text-xs text-muted">Riders near the store are getting your order</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-bg p-4">
                <span className="grid size-11 place-items-center rounded-full bg-success-soft text-2xl" aria-hidden>🛵</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{({ to_store: `${o.rider.name} is heading to the store`, at_store: `${o.rider.name} is at the store`, to_customer: `${o.rider.name} is on the way`, at_customer: `${o.rider.name} has arrived` } as Record<string, string>)[o.live.riderStage ?? ""] ?? (o.status === "out_for_delivery" ? `${o.rider.name} is on the way` : `${o.rider.name} will deliver your order`)}</p>
                  <p className="text-xs text-muted">{o.rider.vehicle}</p>
                </div>
                <a href={`tel:${o.rider.phone}`} aria-label={`Call ${o.rider.name}`} className="grid size-10 place-items-center rounded-full border border-border text-accent hover:bg-accent-soft"><Phone size={18} /></a>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-xl bg-bg p-4">
              <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent"><KeyRound size={20} /></span>
              <div className="flex-1">
                <p className="text-sm font-extrabold">Delivery code</p>
                <p className="text-xs text-muted">Share it with the rider at the door</p>
              </div>
              <span className="text-xl font-extrabold tracking-[0.3em]">{o.deliveryOtp}</span>
            </div>
          </section>
        )}

        {o.status !== "cancelled" && (
          <section className="rounded-xl bg-bg p-4" aria-labelledby="tl-h">
            <h2 id="tl-h" className="sr-only">Order progress</h2>
            <ol className="space-y-0">
              {STEPS.map((s, i) => {
                const done = i < o.live.stepIndex || o.status === "delivered";
                const current = i === o.live.stepIndex && o.status !== "delivered";
                return (
                  <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < STEPS.length - 1 && <span aria-hidden className={`absolute left-[11px] top-6 h-[calc(100%-20px)] w-0.5 ${done ? "bg-success" : "bg-border"}`} />}
                    <span aria-hidden className={`relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${done ? "bg-success text-on-accent" : current ? "bg-accent animate-pulse-dot" : "border-2 border-border bg-bg"}`}>
                      {done && <Check size={14} strokeWidth={4} />}
                    </span>
                    <span>
                      <span className={`block text-sm ${current || done ? "font-extrabold" : "font-semibold text-muted"}`}>{s.label}{current && <span className="sr-only"> (current step)</span>}</span>
                      {current && <span className="block text-xs text-muted">{s.hint}</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {o.status === "delivered" && <RateCard id={o.id} initial={o.rating} />}

        <section className="rounded-xl bg-bg p-4" aria-labelledby="items-h">
          <div className="mb-2 flex items-center justify-between">
            <h2 id="items-h" className="text-[15px] font-bold">{o.items.reduce((s, i) => s + i.qty, 0)} items</h2>
            {final && <button onClick={reorder} className="flex items-center gap-1 text-sm font-bold text-accent"><RotateCcw size={14} /> Order again</button>}
          </div>
          <ul className="divide-y divide-border">
            {o.items.map((it) => {
              const iss = issues.find((x) => x.itemVariantId === it.variantId);
              return (
                <li key={it.variantId} className="flex items-center gap-3 py-2.5">
                  <div className="w-12 shrink-0"><ProductArt label={it.name} icon={it.icon} tint={it.tint} size="sm" /></div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/p/${it.productSlug}`} className="line-clamp-1 text-sm font-semibold hover:underline">{it.name}</Link>
                    <p className="text-xs text-muted">{it.unit} × {it.qty}</p>
                    {iss && <p className="text-xs font-bold text-success">Refunded {inr(iss.refundAmount)} to wallet</p>}
                  </div>
                  <p className="text-sm font-bold">{inr(it.price * it.qty)}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <BillDetails b={o} />

        <section className="rounded-xl bg-bg p-4 text-sm">
          <h2 className="mb-2 text-[15px] font-bold">Order details</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="text-muted">Order ID</dt><dd className="font-semibold">#{o.code}</dd>
            <dt className="text-muted">Payment</dt><dd className="font-semibold">{({ upi: "UPI", card: "Card", cod: "Cash on delivery", wallet: "Wallet" })[o.paymentMethod]} · {({ pending: "to be paid", paid: "paid", refunded: "refunded", failed: "failed" })[o.paymentStatus]}</dd>
            <dt className="text-muted">Deliver to</dt><dd className="font-semibold">{[o.address.houseNo, o.address.building, o.address.area].filter(Boolean).join(", ")}</dd>
            <dt className="text-muted">Placed</dt><dd className="font-semibold">{new Date(o.placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</dd>
            {o.instructions && <><dt className="text-muted">Note</dt><dd className="font-semibold">{o.instructions}</dd></>}
          </dl>
        </section>

        {o.live.canCancel && (
          <Button variant="danger" block onClick={() => setCancelOpen(true)}>Cancel order</Button>
        )}
      </div>

      <CancelSheet open={cancelOpen} onClose={() => setCancelOpen(false)} id={o.id} onDone={(next) => { setO((x) => ({ ...x, ...next, live: { ...x.live, canCancel: false, status: "cancelled" } })); setCancelOpen(false); toast(next.paymentStatus === "refunded" ? "Cancelled. Refund is on its way." : "Order cancelled"); }} />
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} order={o} issues={issues} onIssue={(i) => { setIssues((x) => [...x, i]); toast(i.refundAmount ? `${inr(i.refundAmount)} refunded to your wallet` : "Thanks, our team will get back to you"); }} supportName={user?.name} />
    </div>
  );
}

function RateCard({ id, initial }: { id: string; initial?: number }) {
  const [r, setR] = useState(initial ?? 0);
  const [sent, setSent] = useState(!!initial);
  async function rate(n: number) {
    setR(n); setSent(true);
    await fetch(`/api/orders/${id}/rate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ rating: n }) });
  }
  return (
    <section className="rounded-xl bg-bg p-4 text-center" aria-labelledby="rate-h">
      <h2 id="rate-h" className="text-sm font-extrabold">{sent ? "Thanks for rating!" : "How was your order?"}</h2>
      <div className="mt-2 flex justify-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} role="radio" aria-checked={r === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => rate(n)} className="p-1">
            <Star size={28} className={n <= r ? "fill-brand text-brand" : "text-border"} />
          </button>
        ))}
      </div>
    </section>
  );
}

function CancelSheet({ open, onClose, id, onDone }: { open: boolean; onClose: () => void; id: string; onDone: (o: LiveOrder) => void }) {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function go() {
    setBusy(true); setError("");
    const r = await fetch(`/api/orders/${id}/cancel`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reason }) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setError(d.error);
    onDone(d.order);
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="Cancel this order?">
      <div className="space-y-3 bg-bg p-4">
        <p className="text-sm text-muted">Tell us why. It helps us get better.</p>
        <fieldset className="space-y-1">
          <legend className="sr-only">Reason</legend>
          {CANCEL_REASONS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-surface">
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="size-4 accent-[var(--color-accent)]" /> <span className="text-sm font-semibold">{r}</span>
            </label>
          ))}
        </fieldset>
        {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onClose}>Keep order</Button>
          <Button variant="danger" loading={busy} onClick={go}>Cancel order</Button>
        </div>
      </div>
    </BottomSheet>
  );
}

function HelpSheet({ open, onClose, order, issues, onIssue }: { open: boolean; onClose: () => void; order: LiveOrder; issues: Issue[]; onIssue: (i: Issue) => void; supportName?: string }) {
  const [kind, setKind] = useState<Issue["kind"] | null>(null);
  const [item, setItem] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (!open) { setKind(null); setItem(""); setNote(""); setPhoto(""); setError(""); } }, [open]);

  const meta = ISSUE_KINDS.find((k) => k.key === kind);

  function onFile(f?: File) {
    if (!f) return;
    if (f.size > 4_000_000) return setError("Photo is too large. Pick one under 4 MB.");
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      const scale = Math.min(1, 800 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * scale; c.height = img.height * scale;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      setPhoto(c.toDataURL("image/jpeg", 0.7));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  async function submit() {
    setBusy(true); setError("");
    const r = await fetch(`/api/orders/${order.id}/issues`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, variantId: item || undefined, note, photo: photo || undefined }) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setError(d.error);
    onIssue(d.issue);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={meta ? meta.label : "Need help with this order?"}>
      <div className="space-y-3 bg-bg p-4">
        {order.status !== "delivered" ? (
          <>
            <p className="text-sm text-muted">Your order is {order.status === "cancelled" ? "cancelled" : "still on its way"}. For anything urgent, call the rider or write to us.</p>
            <a href="mailto:help@doorpe.example" className="block rounded-md border border-border px-4 py-3 text-sm font-bold">Email support</a>
          </>
        ) : !kind ? (
          <ul className="divide-y divide-border">
            {ISSUE_KINDS.map((k) => <li key={k.key}><button onClick={() => setKind(k.key)} className="w-full py-3 text-left text-sm font-semibold hover:text-accent">{k.label}</button></li>)}
          </ul>
        ) : (
          <>
            {meta?.needsItem && (
              <fieldset>
                <legend className="mb-2 text-xs font-bold text-muted">Which item?</legend>
                <div className="space-y-1">
                  {order.items.map((it) => {
                    const done = issues.some((x) => x.itemVariantId === it.variantId && x.kind === kind);
                    return (
                      <label key={it.variantId} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 ${item === it.variantId ? "border-accent bg-accent-soft" : "border-border"} ${done ? "opacity-50" : ""}`}>
                        <input type="radio" name="item" disabled={done} checked={item === it.variantId} onChange={() => setItem(it.variantId)} className="sr-only" />
                        <span aria-hidden className="w-10 shrink-0"><ProductArt icon={it.icon} label={it.name} size="sm" /></span>
                        <span className="flex-1 text-sm font-semibold">{it.name} <span className="text-xs text-muted">· {it.unit} × {it.qty}</span></span>
                        <span className="text-sm font-bold">{inr(it.price * it.qty)}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}
            {kind !== "missing" && kind !== "late" && (
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-input p-3 text-sm font-bold text-accent">
                {photo ? <img src={photo} alt="Your photo" className="size-12 rounded-sm object-cover" /> : <Camera size={18} />}
                {photo ? "Change photo" : "Add a photo (helps us fix it faster)"}
                <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-muted">Anything else? (optional)</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} rows={3} className="w-full rounded-md border border-input p-3 text-sm outline-none focus:border-accent" />
            </label>
            {meta?.needsItem && <p className="text-xs text-muted">We&apos;ll refund the item to your wallet straight away. No waiting, no back-and-forth.</p>}
            {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setKind(null)}><X size={14} /> Back</Button>
              <Button loading={busy} disabled={meta?.needsItem && !item} onClick={submit}>Submit</Button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
