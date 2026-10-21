"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { creditWallet, setRole } from "@/app/admin/actions";
import { Card, field, label } from "./ui";

export function CustomerActions({ id, role }: { id: string; role: "customer" | "admin" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("Goodwill credit");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const go = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) => start(async () => {
    const r = await fn(); setMsg({ ok: r.ok, t: r.ok ? done : r.error || "Failed" }); if (r.ok) { setAmount(""); router.refresh(); }
  });
  return (
    <Card title="Actions">
      <form onSubmit={(e) => { e.preventDefault(); go(() => creditWallet(id, Math.round(parseFloat(amount) * 100), note), "Wallet updated"); }} className="grid grid-cols-2 items-end gap-2">
        <label><span className={label}>Wallet amount (₹)</span><input className={field} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.-]/g, ""))} placeholder="50 or -50" /></label>
        <label><span className={label}>Note</span><input className={field} value={note} onChange={(e) => setNote(e.target.value)} /></label>
        <button disabled={pending || !amount} className="col-span-2 h-10 rounded-md bg-accent text-sm font-semibold text-on-accent disabled:opacity-50">Apply to wallet</button>
      </form>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm"><b>Admin access</b><span className="block text-xs text-muted">Can open this panel and change anything</span></span>
        <button disabled={pending} onClick={() => go(() => setRole(id, role === "admin" ? "customer" : "admin"), role === "admin" ? "Admin access removed" : "Made admin")}
          className={`h-9 rounded-md border px-3 text-sm font-semibold ${role === "admin" ? "border-danger text-danger" : "border-accent text-accent"}`}>{role === "admin" ? "Remove admin" : "Make admin"}</button>
      </div>
      {msg && <p role="status" className={`mt-3 text-sm font-semibold ${msg.ok ? "text-success" : "text-danger"}`}>{msg.t}</p>}
    </Card>
  );
}
