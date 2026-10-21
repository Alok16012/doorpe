"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Boxes, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { useApp } from "../AppProvider";
import type { LiveOrder } from "@/lib/orders";
import { inr } from "@/lib/money";

const COLS = [
  { key: "placed", title: "New" }, { key: "packing", title: "Packing" }, { key: "packed", title: "Ready for pickup" },
  { key: "out_for_delivery", title: "Out for delivery" }, { key: "delivered", title: "Delivered" }, { key: "cancelled", title: "Cancelled" },
] as const;
const NEXT_LABEL: Record<string, string> = { placed: "Start packing", packing: "Mark packed", packed: "Hand to rider", out_for_delivery: "Confirm delivery" };

export function OrderBoard({ initial }: { initial: LiveOrder[] }) {
  const [orders, setOrders] = useState(initial);
  const [busy, setBusy] = useState("");
  const { toast } = useApp();

  async function refresh() {
    const r = await fetch("/api/admin/orders");
    if (r.ok) setOrders((await r.json()).orders);
  }
  useEffect(() => { const t = setInterval(refresh, 5000); return () => clearInterval(t); }, []);

  async function advance(o: LiveOrder) {
    let otp: string | undefined;
    if (o.status === "out_for_delivery") {
      otp = prompt(`Enter the 4-digit code from the customer for #${o.code}`) ?? undefined;
      if (otp === undefined) return;
    }
    setBusy(o.id);
    const r = await fetch(`/api/admin/orders/${o.id}/advance`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ otp }) });
    const d = await r.json();
    setBusy("");
    if (!r.ok) return toast(d.error);
    await refresh();
  }

  return (
    <div className="p-3">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={refresh}><RefreshCw size={14} /> Refresh</Button>
        <Link href="/admin/stock" className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-accent px-3 text-xs font-bold text-accent hover:bg-accent-soft"><Boxes size={14} /> Stock</Link>
        <p className="text-xs text-muted">New orders move by themselves in demo mode. Pressing a button takes manual control of that order.</p>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-4">
        {COLS.map((c) => {
          const list = orders.filter((o) => o.status === c.key);
          return (
            <section key={c.key} className="w-72 shrink-0 rounded-md bg-bg p-2" aria-label={c.title}>
              <h2 className="flex items-center justify-between px-1 pb-2 text-sm font-extrabold">{c.title}<span className="rounded-pill bg-surface px-2 text-xs">{list.length}</span></h2>
              <ul className="space-y-2">
                {list.map((o) => (
                  <li key={o.id} className="rounded-sm border border-border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <Link href={`/orders/${o.id}`} className="font-extrabold hover:underline">#{o.code}</Link>
                      <span className="text-xs text-muted">{new Date(o.placedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
                    <p className="mt-1 text-xs"><b>{inr(o.grandTotal)}</b> · {o.paymentMethod.toUpperCase()} · {o.address.area.split(",")[0]}</p>
                    {o.instructions && <p className="mt-1 rounded-xs bg-warning/10 px-1.5 py-0.5 text-xs text-warning">{o.instructions}</p>}
                    {NEXT_LABEL[o.status] && <Button size="sm" block className="mt-2" loading={busy === o.id} onClick={() => advance(o)}>{NEXT_LABEL[o.status]}</Button>}
                  </li>
                ))}
                {!list.length && <li className="px-1 py-4 text-center text-xs text-faint">Nothing here</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
