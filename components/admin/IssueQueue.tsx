"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveIssue } from "@/app/admin/actions";
import type { Issue, User } from "@/lib/types";
import { inr } from "@/lib/money";
import { Pill, field } from "./ui";

type Row = Issue & { order?: { id: string; code: string; grandTotal: number }; item?: { name: string; unit: string; qty: number; price: number }; customer?: User };
const KIND: Record<Issue["kind"], string> = { missing: "Item missing", damaged: "Damaged / leaking", wrong: "Wrong item", quality: "Poor quality", late: "Late delivery", other: "Something else" };

function IssueCard({ i }: { i: Row }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [amount, setAmount] = useState(i.item ? String((i.item.price * i.item.qty) / 100) : "");
  const [err, setErr] = useState("");
  const act = (a: "refund" | "reject") => start(async () => {
    const r = await resolveIssue(i.id, a, Math.round(parseFloat(amount || "0") * 100));
    if (!r.ok) setErr(r.error); else router.refresh();
  });
  return (
    <li className="rounded-xl border border-border bg-bg p-4">
      <div className="flex flex-wrap items-start gap-3">
        {i.photo && <a href={i.photo} target="_blank" rel="noreferrer"><img src={i.photo} alt="Customer's photo" className="size-20 rounded-md object-cover" /></a>}
        <div className="min-w-0 flex-1">
          <p className="font-bold">{KIND[i.kind]}{i.item && <span className="font-normal text-muted"> · {i.item.name} ({i.item.unit} × {i.item.qty})</span>}</p>
          <p className="text-xs text-muted">
            {i.order && <Link href={`/admin/orders/${i.order.id}`} className="font-semibold text-accent">#{i.order.code}</Link>} · {i.customer?.name || `+91 ${i.customer?.phone}`} · {new Date(i.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
          </p>
          {i.note && <p className="mt-2 rounded-md bg-surface px-3 py-2 text-sm">“{i.note}”</p>}
        </div>
        <Pill on={i.status === "refunded"}>{i.status === "refunded" ? `Refunded ${inr(i.refundAmount)}` : i.status === "rejected" ? "Rejected" : "Open"}</Pill>
      </div>
      {i.status === "open" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <label className="flex items-center gap-2 text-sm">₹<input className={`${field} w-28`} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} aria-label="Refund amount" /></label>
          <button disabled={pending || !amount} onClick={() => act("refund")} className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent disabled:opacity-50">Refund to wallet</button>
          <button disabled={pending} onClick={() => act("reject")} className="h-10 rounded-md border border-border px-4 text-sm font-semibold text-muted hover:border-input">Reject</button>
          {err && <span className="text-sm font-semibold text-danger">{err}</span>}
        </div>
      )}
    </li>
  );
}

export function IssueQueue({ rows }: { rows: Row[] }) {
  if (!rows.length) return <p className="rounded-xl border border-border bg-bg p-10 text-center text-sm text-muted">Nothing here. 🎉</p>;
  return <ul className="space-y-3">{rows.map((i) => <IssueCard key={i.id} i={i} />)}</ul>;
}
