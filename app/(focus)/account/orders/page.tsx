import Link from "next/link";
import { emojiSrc } from "@/lib/emoji";
import type { Metadata } from "next";
import { ChevronRight, Package } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { TitleBar } from "@/components/ui/TitleBar";
import { LoginPrompt } from "@/components/account/AccountBits";
import { inr } from "@/lib/money";

export const metadata: Metadata = { title: "Your orders" };

const LABEL = { placed: "Placed", packing: "Packing", packed: "Packed", out_for_delivery: "On the way", delivered: "Delivered", cancelled: "Cancelled" } as const;
const TONE = { placed: "bg-info-soft text-info", packing: "bg-info-soft text-info", packed: "bg-info-soft text-info", out_for_delivery: "bg-brand/40 text-text", delivered: "bg-success-soft text-success", cancelled: "bg-surface text-muted" } as const;

export default async function OrdersPage() {
  const user = await currentUser();
  if (!user) return (<><TitleBar title="Your orders" back="/account" tabRoot /><LoginPrompt title="Log in to see your orders" /></>);
  const orders = await listOrders(user);
  return (
    <>
      <TitleBar title="Your orders" back="/account" tabRoot />
      <div className="mx-auto max-w-xl space-y-3 p-3">
        {orders.length === 0 ? (
          <div className="rounded-lg bg-bg px-6 py-12 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-accent-soft text-accent"><Package size={28} /></span>
            <p className="mt-4 font-extrabold">No orders yet</p>
            <p className="mt-1 text-sm text-muted">Your first order is a few taps away.</p>
            <Link href="/" className="mt-5 inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-bold text-on-accent">Start shopping</Link>
          </div>
        ) : orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="block rounded-md bg-bg p-4 hover:shadow-card">
            <div className="flex items-center justify-between">
              <span className={`rounded-pill px-2 py-0.5 text-xs font-extrabold ${TONE[o.status]}`}>{LABEL[o.status]}</span>
              <span className="text-xs text-muted">{new Date(o.placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {o.items.slice(0, 5).map((it) => <span key={it.variantId} aria-hidden className="grid size-11 place-items-center overflow-hidden rounded-sm p-1" style={{ background: it.tint }}><img src={emojiSrc(it.icon, it.name)} alt="" loading="lazy" className="size-full rounded-sm object-contain" /></span>)}
              {o.items.length > 5 && <span className="grid size-11 place-items-center rounded-sm bg-surface text-xs font-bold">+{o.items.length - 5}</span>}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span><b>{inr(o.grandTotal)}</b> <span className="text-muted">· #{o.code} · {o.items.reduce((s, i) => s + i.qty, 0)} items</span></span>
              <ChevronRight size={18} className="text-muted" aria-hidden />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
