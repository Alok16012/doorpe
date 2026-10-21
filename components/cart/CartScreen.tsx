"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Share2, ShoppingBasket, Timer, TriangleAlert, Truck } from "lucide-react";
import { TitleBar } from "../ui/TitleBar";
import { Button } from "../ui/Button";
import { useApp } from "../AppProvider";
import { cart } from "./store";
import { useQuote } from "./useQuote";
import { BillDetails } from "./BillDetails";
import { Stepper, lineFor } from "../shop/AddToCart";
import { ProductArt } from "../shop/ProductArt";
import { ProductCard } from "../shop/ProductCard";
import type { CardProduct } from "@/lib/dto";
import { inr } from "@/lib/money";

export function CartScreen({ picks, eta, shared }: { picks: CardProduct[]; eta: number | null; shared: { card: CardProduct; variantId: string; qty: number }[] }) {
  const router = useRouter();
  const { user, openLogin, loc, svc, openLocation, toast } = useApp();
  const { quote, lines, loading, error } = useQuote();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // keep the local snapshot honest (price changes, stock caps)
  useEffect(() => {
    if (quote && quote.lines.some((l) => l.problem || lines.find((x) => x.variantId === l.variantId)?.price !== l.price)) cart.syncFromQuote(quote);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote]);

  const sharedOpen = shared.length > 0;
  function addShared() {
    for (const s of shared) {
      const v = s.card.variants.find((x) => x.id === s.variantId)!;
      for (let i = cart.qty(v.id); i < s.qty; i++) if (!cart.add(lineFor(s.card, v))) break;
    }
    router.replace("/cart");
    toast("Shared items added to your cart");
  }

  async function share() {
    const url = `${location.origin}/cart?items=${lines.map((l) => `${l.variantId}:${l.qty}`).join(",")}`;
    try {
      if (navigator.share) await navigator.share({ title: "My cart", url });
      else { await navigator.clipboard.writeText(url); toast("Cart link copied"); }
    } catch {}
  }

  const byId = useMemo(() => new Map(lines.map((l) => [l.variantId, l])), [lines]);
  const problems = quote?.lines.filter((l) => l.problem) ?? [];

  if (!hydrated) return <><TitleBar title="My Cart" center /><div className="mx-auto max-w-3xl space-y-3 p-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-md" />)}</div></>;

  if (!lines.length)
    return (
      <div className="min-h-dvh bg-surface">
        <TitleBar title="My Cart" center />
        <div className="mx-auto max-w-3xl p-3">
          {sharedOpen && <SharedBanner count={shared.length} onAdd={addShared} />}
          <div className="rounded-lg bg-bg px-6 py-12 text-center">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-accent-soft text-accent"><ShoppingBasket size={36} /></span>
            <h2 className="mt-4 text-lg font-extrabold">Your cart is empty</h2>
            <p className="mt-1 text-sm text-muted">Fill it up. Most things get to you before the kettle boils.</p>
            <Link href="/" className="mt-5 inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-bold text-on-accent hover:bg-accent-hover">Start shopping</Link>
          </div>
        </div>
      </div>
    );

  const gap = quote?.freeDeliveryGap ?? 0;
  const canCheckout = !!quote && quote.itemCount > 0 && !!svc?.ok && svc.open;

  return (
    <div className="min-h-dvh bg-surface pb-32">
      <TitleBar title="My Cart" center right={<button onClick={share} className="flex items-center gap-1 rounded-md px-3 py-2 text-[15px] font-semibold text-accent"><Share2 size={16} /> Share</button>} />
      <div className="mx-auto max-w-3xl space-y-3 p-3">
        {sharedOpen && <SharedBanner count={shared.length} onAdd={addShared} />}
        {quote && quote.savings > 0 && (
          <p className="flex items-center justify-between rounded-lg bg-info-soft px-4 py-3 text-[15px] font-semibold text-info">
            <span>Your total savings</span><span>{inr(quote.savings)}</span>
          </p>
        )}

        <section className="rounded-xl bg-bg" aria-label="Items">
          <div className="flex items-center gap-3 p-4">
            <span className="grid size-12 place-items-center rounded-lg bg-surface"><Timer size={24} strokeWidth={2.2} aria-hidden /></span>
            <div>
              <p className="text-[17px] font-bold text-text">{svc?.ok ? `Delivery in ${svc.etaMin} minutes` : loc ? "Not deliverable to this location" : "Set a location to see delivery time"}</p>
              <p className="text-xs text-muted">Shipment of {quote?.itemCount ?? lines.reduce((s, l) => s + l.qty, 0)} item{(quote?.itemCount ?? 2) > 1 ? "s" : ""}</p>
            </div>
          </div>
          {problems.length > 0 && (
            <p className="mx-4 mb-2 flex items-start gap-2 rounded-sm bg-warning/10 px-3 py-2 text-xs font-semibold text-warning">
              <TriangleAlert size={14} className="mt-0.5 shrink-0" /> Some items changed at your store. We&apos;ve updated the quantities below.
            </p>
          )}
          <ul className="divide-y divide-border">
            {(quote?.lines ?? lines.map((l) => ({ ...l, productSlug: l.slug, available: l.max, problem: undefined }))).map((l) => {
              const local = byId.get(l.variantId);
              const card: CardProduct = { slug: l.productSlug, name: l.name, brand: "", icon: l.icon, tint: l.tint, variants: [{ id: l.variantId, unit: l.unit, price: l.price, mrp: l.mrp, stock: l.available }] };
              return (
                <li key={l.variantId} className="flex items-center gap-3 px-4 py-3">
                  <Link href={`/p/${l.productSlug}`} className="w-[70px] shrink-0 rounded-lg border border-border"><ProductArt icon={l.icon} size="sm" dim={l.problem === "out_of_stock"} /></Link>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] leading-4 text-text">{l.name}</p>
                    <p className="text-xs text-muted">{l.unit}</p>
                    <p className="mt-1 text-[13px]"><b className="font-bold">{inr(l.price)}</b>{l.mrp > l.price && <s className="ml-1.5 text-xs text-faint">{inr(l.mrp)}</s>}</p>
                    {l.problem === "out_of_stock" && <p className="text-xs font-bold text-danger">Sold out at your store</p>}
                    {l.problem === "reduced" && <p className="text-xs font-bold text-warning">Only {l.available} available</p>}
                  </div>
                  {l.problem === "out_of_stock" || !local
                    ? <button onClick={() => cart.set(l.variantId, 0)} className="text-xs font-bold text-danger">Remove</button>
                    : <Stepper p={card} v={card.variants[0]} />}
                </li>
              );
            })}
          </ul>
        </section>

        {quote && quote.itemCount > 0 && (
          <div className="rounded-md bg-bg p-4">
            {gap > 0 ? (
              <>
                <p className="flex items-center gap-2 text-sm font-bold"><Truck size={16} className="text-accent" /> Add {inr(gap)} more for free delivery</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-surface" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((quote.itemsTotal / (quote.itemsTotal + gap)) * 100)}>
                  <div className="h-full rounded-pill bg-accent transition-[width]" style={{ width: `${(quote.itemsTotal / (quote.itemsTotal + gap)) * 100}%` }} />
                </div>
              </>
            ) : (
              <p className="flex items-center gap-2 text-sm font-bold text-success"><Truck size={16} /> Free delivery unlocked</p>
            )}
          </div>
        )}

        <section aria-label="You might need">
          <h2 className="px-1 pb-3 pt-1 text-base font-bold">You might also like</h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {picks.filter((p) => !byId.has(p.variants[0].id)).map((p) => <ProductCard key={p.slug} p={p} eta={eta} variant="rail" />)}
          </div>
        </section>

        {quote && quote.itemCount > 0 && <BillDetails b={quote} />}
        {error && <p className="text-center text-sm text-danger">Couldn&apos;t refresh prices. Check your connection.</p>}

        <section className="rounded-xl bg-bg p-4">
          <h2 className="text-[15px] font-bold">Cancellation Policy</h2>
          <p className="mt-1 text-xs leading-[18px] text-muted">You can cancel for free until we start packing. Once your items are packed, the order can&apos;t be cancelled. If we&apos;re running late, we&apos;ll tell you, and refund where it&apos;s fair.</p>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg px-3 py-3 shadow-bar">
        <div className="mx-auto max-w-3xl">
          {!loc || !svc?.ok ? (
            <Button size="lg" block onClick={() => openLocation()}>{loc ? "Change delivery location" : "Set delivery location"}</Button>
          ) : !svc.open ? (
            <Button size="lg" block disabled>Store is closed right now</Button>
          ) : (
            <button
              disabled={!canCheckout || loading}
              onClick={() => (user ? router.push("/checkout") : openLogin(() => router.push("/checkout")))}
              className="flex h-[58px] w-full items-center justify-between rounded-lg bg-accent px-4 text-on-accent hover:bg-accent-hover disabled:opacity-70"
            >
              <span className="text-left leading-tight"><span className="block text-base font-bold">{quote ? inr(quote.grandTotal) : "…"}</span><span className="block text-[10px] font-semibold uppercase opacity-90">Total</span></span>
              <span className="text-[17px] font-semibold">{user ? "Proceed ›" : "Login to Proceed ›"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SharedBanner({ count, onAdd }: { count: number; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-accent/30 bg-accent-soft p-3">
      <p className="text-sm font-bold text-accent">Someone shared a cart with {count} item{count > 1 ? "s" : ""}</p>
      <Button size="sm" onClick={onAdd}>Add all</Button>
    </div>
  );
}
