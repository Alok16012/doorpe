"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveFees } from "@/app/admin/actions";
import type { FeeSettings } from "@/lib/fees";
import { Card, field, label } from "./ui";

const rs = (p: number) => String(p / 100);
const ps = (s: string) => Math.round(parseFloat(s || "0") * 100);

export function FeesForm({ initial }: { initial: FeeSettings }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [f, setF] = useState({
    delivery: rs(initial.delivery), freeDeliveryAbove: rs(initial.freeDeliveryAbove), handling: rs(initial.handling),
    smallCart: rs(initial.smallCart), smallCartBelow: rs(initial.smallCartBelow), tips: initial.tipOptions.map(rs).join(", "),
  });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await saveFees({
        delivery: ps(f.delivery), freeDeliveryAbove: ps(f.freeDeliveryAbove), handling: ps(f.handling), smallCart: ps(f.smallCart), smallCartBelow: ps(f.smallCartBelow),
        tipOptions: f.tips.split(",").map((t) => ps(t.trim())).filter((n) => n > 0),
      });
      setMsg({ ok: r.ok, t: r.ok ? "Saved" : r.error }); router.refresh();
    });
  }
  const box = (k: keyof typeof f, l: string, hint?: string) => (
    <label><span className={label}>{l}</span><input className={field} inputMode="decimal" value={f[k]} onChange={set(k)} />{hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}</label>
  );
  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <Card title="Delivery">
        <div className="grid gap-3 sm:grid-cols-2">
          {box("delivery", "Delivery fee (₹)")}
          {box("freeDeliveryAbove", "Free delivery above (₹)", "Item total at or above this gets free delivery")}
        </div>
      </Card>
      <Card title="Other charges">
        <div className="grid gap-3 sm:grid-cols-2">
          {box("handling", "Handling fee per order (₹)")}
          <span />
          {box("smallCart", "Small order fee (₹)")}
          {box("smallCartBelow", "Charged when items total below (₹)")}
        </div>
      </Card>
      <Card title="Rider tips">{box("tips", "Tip buttons at checkout (₹, comma separated)", "Up to 6 amounts, e.g. 10, 20, 30, 50")}</Card>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="h-11 rounded-md bg-accent px-6 text-sm font-semibold text-on-accent disabled:opacity-60">{pending ? "Saving…" : "Save settings"}</button>
        {msg && <span role="status" className={`text-sm font-semibold ${msg.ok ? "text-success" : "text-danger"}`}>{msg.t}</span>}
      </div>
    </form>
  );
}
