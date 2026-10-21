"use client";
import { useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { cart, useCart, useQty } from "../cart/store";
import { useApp } from "../AppProvider";
import type { CardProduct } from "@/lib/dto";
import { BottomSheet } from "../ui/BottomSheet";
import { ProductArt } from "./ProductArt";
import { inr, pctOff } from "@/lib/money";

const MAX = 10;

export function lineFor(p: CardProduct, v: CardProduct["variants"][number]) {
  return { variantId: v.id, price: v.price, mrp: v.mrp, name: p.name, unit: v.unit, icon: p.icon, tint: p.tint, slug: p.slug, max: Math.min(MAX, v.stock) };
}

export function Stepper({ p, v, size = "sm" }: { p: CardProduct; v: CardProduct["variants"][number]; size?: "sm" | "lg" }) {
  const qty = useQty(v.id);
  const { toast } = useApp();
  const inc = () => { if (!cart.add(lineFor(p, v))) toast(v.stock <= qty ? `Only ${v.stock} left in stock` : `You can add up to ${MAX} of this item`); };
  const h = size === "lg" ? "h-10 min-w-[104px] text-base" : "h-8 min-w-[72px] text-sm";
  if (v.stock <= 0)
    return <button disabled className={`${h} rounded-sm border border-border bg-surface px-3 font-bold text-faint`}>Sold out</button>;
  if (!qty)
    return (
      <button onClick={inc} aria-label={`Add ${p.name}, ${v.unit}`} className={`${h} rounded-sm border border-accent bg-accent-soft px-3 font-extrabold text-accent transition-colors hover:bg-accent hover:text-on-accent`}>
        ADD
      </button>
    );
  return (
    <div className={`${h} flex items-center justify-between rounded-sm bg-accent font-extrabold text-on-accent animate-bump`} role="group" aria-label={`${p.name} quantity`}>
      <button onClick={() => cart.dec(v.id)} aria-label={`Remove one ${p.name}`} className="grid h-full w-7 place-items-center"><Minus size={14} strokeWidth={3} /></button>
      <span aria-live="polite" className="tabular-nums">{qty}</span>
      <button onClick={inc} aria-label={`Add one more ${p.name}`} className="grid h-full w-7 place-items-center"><Plus size={14} strokeWidth={3} /></button>
    </div>
  );
}

/** ADD button for a card. Multi-variant products open a picker. */
export function AddToCart({ p }: { p: CardProduct }) {
  const [open, setOpen] = useState(false);
  const { lines } = useCart();
  const inCart = lines.filter((l) => p.variants.some((v) => v.id === l.variantId)).reduce((s, l) => s + l.qty, 0);

  if (p.variants.length === 1) return <Stepper p={p} v={p.variants[0]} />;

  return (
    <>
      <div className="flex flex-col items-center">
        {inCart > 0 ? (
          <button onClick={() => setOpen(true)} className="flex h-8 min-w-[72px] items-center justify-center gap-1 rounded-sm bg-accent px-3 text-sm font-extrabold text-on-accent" aria-label={`${inCart} in cart, change options for ${p.name}`}>
            {inCart} <ChevronDown size={14} />
          </button>
        ) : (
          <button onClick={() => setOpen(true)} aria-label={`Choose a size for ${p.name}`} className="h-8 min-w-[72px] rounded-sm border border-accent bg-accent-soft px-3 text-sm font-extrabold text-accent hover:bg-accent hover:text-on-accent">
            ADD
          </button>
        )}
        <span className="mt-0.5 text-2xs font-semibold text-muted">{p.variants.length} sizes</span>
      </div>
      <VariantSheet p={p} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function VariantSheet({ p, open, onClose }: { p: CardProduct; open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title={p.name}>
      <ul className="space-y-2 p-4">
        {p.variants.map((v) => {
          const off = pctOff(v.price, v.mrp);
          return (
            <li key={v.id} className="flex items-center gap-3 rounded-md bg-bg p-3">
              <div className="w-14 shrink-0"><ProductArt icon={p.icon} tint={p.tint} size="sm" dim={v.stock <= 0} /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{v.unit}</p>
                <p className="text-sm">
                  <span className="font-extrabold">{inr(v.price)}</span>
                  {off > 0 && <><s className="ml-1.5 text-xs text-faint">{inr(v.mrp)}</s><span className="ml-1.5 text-xs font-bold text-deal">{off}% off</span></>}
                </p>
              </div>
              <Stepper p={p} v={v} />
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}
