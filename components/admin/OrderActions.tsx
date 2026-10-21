"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { advance, cancelOrder } from "@/app/admin/actions";
import type { OrderStatus } from "@/lib/types";
import { Card, field } from "./ui";

const NEXT: Partial<Record<OrderStatus, string>> = { placed: "Start packing", packing: "Mark packed", packed: "Hand to rider", out_for_delivery: "Confirm delivery" };

export function OrderActions({ id, status, mode }: { id: string; status: OrderStatus; mode: "auto" | "manual" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [otp, setOtp] = useState("");
  const [reason, setReason] = useState("Item unavailable");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (status === "delivered" || status === "cancelled") return null;
  const go = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => { const r = await fn(); setMsg(r.ok ? { ok: true, text: done } : { ok: false, text: r.error || "Failed" }); router.refresh(); });
  return (
    <Card title="Actions">
      {mode === "auto" && <p className="mb-3 text-xs text-muted">This order moves by itself in demo mode. Using a button switches it to manual.</p>}
      <div className="flex flex-wrap items-end gap-2">
        {status === "out_for_delivery" && (
          <label className="w-36"><span className="mb-1 block text-xs font-semibold text-muted">Customer&apos;s code</span>
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className={field} placeholder="4 digits" />
          </label>
        )}
        {NEXT[status] && (
          <button disabled={pending || (status === "out_for_delivery" && otp.length !== 4)} onClick={() => go(() => advance(id, status === "out_for_delivery" ? otp : undefined), "Updated")}
            className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent disabled:opacity-50">{NEXT[status]}</button>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
        <label className="min-w-[200px] flex-1"><span className="mb-1 block text-xs font-semibold text-muted">Cancel reason</span>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={field}>
            {["Item unavailable", "Store closed", "Customer asked to cancel", "Address unreachable", "Suspected fraud"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <button disabled={pending} onClick={() => { if (confirm("Cancel this order? Paid orders are refunded to the customer's wallet.")) go(() => cancelOrder(id, reason), "Order cancelled"); }}
          className="h-10 rounded-md border border-danger px-4 text-sm font-semibold text-danger hover:bg-danger/5 disabled:opacity-50">Cancel & refund</button>
      </div>
      {msg && <p role="status" className={`mt-3 text-sm font-semibold ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
    </Card>
  );
}
