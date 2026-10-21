"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteCoupon, saveCoupon } from "@/app/admin/actions";
import type { StoredCoupon } from "@/lib/settings";
import { inr } from "@/lib/money";
import { BottomSheet } from "../ui/BottomSheet";
import { Switch } from "./ActiveToggle";
import { Pill, field, label } from "./ui";

type Draft = { code: string; title: string; kind: StoredCoupon["kind"]; value: string; minOrder: string; maxDiscount: string; firstOrderOnly: boolean; validTo: string; active: boolean };
const blank: Draft = { code: "", title: "", kind: "flat", value: "", minOrder: "0", maxDiscount: "", firstOrderOnly: false, validTo: "", active: true };

function describe(c: StoredCoupon) {
  const what = c.kind === "flat" ? `${inr(c.value)} off` : c.kind === "percent" ? `${c.value}% off${c.maxDiscount ? ` up to ${inr(c.maxDiscount)}` : ""}` : "Free delivery";
  return `${what}${c.minOrder ? ` above ${inr(c.minOrder)}` : ""}${c.firstOrderOnly ? " · first order only" : ""}`;
}

export function CouponManager({ coupons, usage }: { coupons: StoredCoupon[]; usage: Record<string, number> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [edit, setEdit] = useState<{ original?: string; d: Draft } | null>(null);
  const [error, setError] = useState("");

  function open(c?: StoredCoupon) {
    setError("");
    setEdit(c ? {
      original: c.code,
      d: { code: c.code, title: c.title, kind: c.kind, value: c.kind === "percent" ? String(c.value) : String(c.value / 100), minOrder: String(c.minOrder / 100), maxDiscount: c.maxDiscount ? String(c.maxDiscount / 100) : "", firstOrderOnly: !!c.firstOrderOnly, validTo: c.validTo?.slice(0, 10) ?? "", active: c.active },
    } : { d: blank });
  }
  function save() {
    if (!edit) return;
    const d = edit.d;
    start(async () => {
      const r = await saveCoupon({
        code: d.code, title: d.title, kind: d.kind, active: d.active, firstOrderOnly: d.firstOrderOnly,
        value: d.kind === "percent" ? Number(d.value) : Math.round(Number(d.value || 0) * 100),
        minOrder: Math.round(Number(d.minOrder || 0) * 100),
        maxDiscount: d.maxDiscount ? Math.round(Number(d.maxDiscount) * 100) : undefined,
        validTo: d.validTo ? new Date(d.validTo + "T23:59:59+05:30").toISOString() : undefined,
      }, edit.original);
      if (!r.ok) return setError(r.error);
      setEdit(null); router.refresh();
    });
  }
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEdit((e) => (e ? { ...e, d: { ...e.d, [k]: v } } : e));

  return (
    <>
      <div className="mb-3 flex justify-end"><button onClick={() => open()} className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent"><Plus size={16} /> New coupon</button></div>
      <ul className="grid gap-3 md:grid-cols-2">
        {coupons.map((c) => {
          const expired = c.validTo && Date.parse(c.validTo) < Date.now();
          return (
            <li key={c.code} className="rounded-xl border border-dashed border-input bg-bg p-4">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="font-mono text-lg font-bold tracking-wider">{c.code}</p>
                  <p className="text-sm">{c.title}</p>
                  <p className="mt-1 text-xs text-muted">{describe(c)}{c.validTo ? ` · until ${new Date(c.validTo).toLocaleDateString("en-IN")}` : ""}</p>
                </div>
                <Pill on={c.active && !expired}>{expired ? "Expired" : c.active ? "Active" : "Off"}</Pill>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted">Used on {usage[c.code] || 0} orders</span>
                <span className="flex gap-1">
                  <button onClick={() => open(c)} aria-label={`Edit ${c.code}`} className="grid size-8 place-items-center rounded-md hover:bg-surface"><Pencil size={15} /></button>
                  <button disabled={pending} onClick={() => { if (confirm(`Delete ${c.code}?`)) start(async () => { await deleteCoupon(c.code); router.refresh(); }); }} aria-label={`Delete ${c.code}`} className="grid size-8 place-items-center rounded-md text-danger hover:bg-danger/5"><Trash2 size={15} /></button>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <BottomSheet open={!!edit} onClose={() => setEdit(null)} title={edit?.original ? `Edit ${edit.original}` : "New coupon"}>
        {edit && (
          <div className="grid grid-cols-2 gap-3 bg-bg p-4">
            <label><span className={label}>Code *</span><input autoFocus className={`${field} font-mono uppercase`} value={edit.d.code} onChange={(e) => set("code", e.target.value.toUpperCase())} /></label>
            <label><span className={label}>Type</span>
              <select className={field} value={edit.d.kind} onChange={(e) => set("kind", e.target.value as Draft["kind"])}>
                <option value="flat">Flat ₹ off</option><option value="percent">% off</option><option value="free_delivery">Free delivery</option>
              </select>
            </label>
            <label className="col-span-2"><span className={label}>What customers see *</span><input className={field} value={edit.d.title} onChange={(e) => set("title", e.target.value)} placeholder="₹50 off on orders above ₹299" /></label>
            {edit.d.kind !== "free_delivery" && <label><span className={label}>{edit.d.kind === "percent" ? "Percent" : "Amount (₹)"}</span><input className={field} inputMode="decimal" value={edit.d.value} onChange={(e) => set("value", e.target.value)} /></label>}
            {edit.d.kind === "percent" && <label><span className={label}>Max discount (₹)</span><input className={field} inputMode="decimal" value={edit.d.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} /></label>}
            <label><span className={label}>Minimum order (₹)</span><input className={field} inputMode="decimal" value={edit.d.minOrder} onChange={(e) => set("minOrder", e.target.value)} /></label>
            <label><span className={label}>Valid until</span><input type="date" className={field} value={edit.d.validTo} onChange={(e) => set("validTo", e.target.value)} /></label>
            <div className="col-span-2 flex items-center justify-between"><span className="text-sm font-semibold">First order only</span><Switch on={edit.d.firstOrderOnly} onChange={(v) => set("firstOrderOnly", v)} label="First order only" /></div>
            <div className="col-span-2 flex items-center justify-between"><span className="text-sm font-semibold">Active</span><Switch on={edit.d.active} onChange={(v) => set("active", v)} label="Active" /></div>
            {error && <p role="alert" className="col-span-2 text-sm font-semibold text-danger">{error}</p>}
            <button disabled={pending} onClick={save} className="col-span-2 h-11 rounded-md bg-accent text-sm font-semibold text-on-accent disabled:opacity-60">{pending ? "Saving…" : "Save coupon"}</button>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
