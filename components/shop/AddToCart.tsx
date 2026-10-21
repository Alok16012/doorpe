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

export function Stepper({ p, v, size = "sm" }: { p: CardProduct; v: CardProduct["variants"][number]; size?: "sm" | "lg" | "plus" }) {
  const qty = useQty(v.id);
  const { toast } = useApp();
  const inc = () => { if (!cart.add(lineFor(p, v))) toast(v.stock <= qty ? `Only ${v.stock} left in stock` : `You can add up to ${MAX} of this item`); };
  if (size === "plus") {
    if (v.stock <= 0) return null;
    if (!qty)
      return (
        <button onClick={inc} aria-label={`Add ${p.name}, ${v.unit}`} className="grid size-8 place-items-center rounded-lg border border-accent bg-bg text-accent shadow-[0_2px_6px_rgba(17,26,58,0.15)]">
          <Plus size={18} strokeWidth={2.6} />
        </button>
      );
    return (
      <div className="flex h-8 w-[78px] items-center justify-between rounded-lg bg-accent text-[13px] font-bold text-on-accent shadow-[0_2px_6px_rgba(17,26,58,0.2)]" role="group" aria-label={`${p.name} quantity`}>
        <button onClick={() => cart.dec(v.id)} aria-label={`Remove one ${p.name}`} className="grid h-full w-7 place-items-center"><Minus size={13} strokeWidth={3} /></button>
        <span aria-live="polite" className="tabular-nums">{qty}</span>
        <button onClick={inc} aria-label={`Add one more ${p.name}`} className="grid h-full w-7 place-items-center"><Plus size={13} strokeWidth={3} /></button>
      </div>
    );
  }
  const box = size === "lg" ? "h-12 w-[140px] text-base rounded-lg" : "h-8 w-[66px] text-[13px] rounded-sm";
  if (v.stock <= 0)
    return <button disabled className={`${box} border border-border bg-search font-semibold text-faint`}>Sold out</button>;
  if (!qty)
    return (
      <button onClick={inc} aria-label={`Add ${p.name}, ${v.unit}`}
        className={`${box} font-semibold ${size === "lg" ? "bg-accent text-on-accent" : "border border-add bg-accent-soft uppercase text-add"}`}>
        {size === "lg" ? "Add to cart" : "ADD"}
      </button>
    );
  return (
    <div className={`${box} flex items-center justify-between ${size === "lg" ? "bg-accent px-2" : "bg-add"} font-semibold text-on-accent`} role="group" aria-label={`${p.name} quantity`}>
      <button onClick={() => cart.dec(v.id)} aria-label={`Remove one ${p.name}`} className="grid h-full w-7 place-items-center"><Minus size={13} strokeWidth={3} /></button>
      <span aria-live="polite" className="tabular-nums">{qty}</span>
      <button onClick={inc} aria-label={`Add one more ${p.name}`} className="grid h-full w-7 place-items-center"><Plus size={13} strokeWidth={3} /></button>
    </div>
  );
}

/** ADD button for a card. Multi-size products open a picker and say "N options". */
export function AddToCart({ p, plus = false }: { p: CardProduct; plus?: boolean }) {
  const [open, setOpen] = useState(false);
  const { lines } = useCart();
  const inCart = lines.filter((l) => p.variants.some((v) => v.id === l.variantId)).reduce((s, l) => s + l.qty, 0);
  if (p.variants.length === 1) return <Stepper p={p} v={p.variants[0]} size={plus ? "plus" : "sm"} />;
  if (plus)
    return (
      <>
        <button onClick={() => setOpen(true)} aria-label={inCart ? `${inCart} in cart, change sizes of ${p.name}` : `Choose a size for ${p.name}`}
          className={`relative grid place-items-center rounded-lg shadow-[0_2px_6px_rgba(17,26,58,0.15)] ${inCart ? "h-8 min-w-8 bg-accent px-2 text-[13px] font-bold text-on-accent" : "size-8 border border-accent bg-bg text-accent"}`}>
          {inCart ? inCart : <Plus size={18} strokeWidth={2.6} />}
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xs bg-bg px-1 text-[8px] font-semibold leading-3 text-muted shadow-sm">{p.variants.length} sizes</span>
        </button>
        <VariantSheet p={p} open={open} onClose={() => setOpen(false)} />
      </>
    );
  return (
    <>
      {inCart > 0 ? (
        <div className="flex h-8 w-[66px] items-center justify-between rounded-sm bg-add text-[13px] font-semibold text-on-accent">
          <button onClick={() => setOpen(true)} aria-label={`Change sizes of ${p.name}`} className="grid h-full w-7 place-items-center"><Minus size={13} strokeWidth={3} /></button>
          <span className="tabular-nums">{inCart}</span>
          <button onClick={() => setOpen(true)} aria-label={`Add a size of ${p.name}`} className="grid h-full w-7 place-items-center"><Plus size={13} strokeWidth={3} /></button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} aria-label={`Choose a size for ${p.name}`}
          className="flex h-8 w-[66px] flex-col items-center justify-center rounded-sm border border-add bg-accent-soft leading-none text-add">
          <span className="text-[13px] font-semibold">ADD</span>
          <span className="mt-0.5 text-[8px] font-medium text-muted">{p.variants.length} options</span>
        </button>
      )}
      <VariantSheet p={p} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Green unit line with a caret, opens the size picker (used on cards with sizes). */
export function UnitPicker({ p }: { p: CardProduct }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-0.5 text-xs font-medium text-add">
        {p.variants[0].unit} <ChevronDown size={14} strokeWidth={2.5} />
      </button>
      <VariantSheet p={p} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function VariantSheet({ p, open, onClose }: { p: CardProduct; open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title={p.name}>
      <ul className="space-y-3 p-4">
        {p.variants.map((v) => {
          const off = pctOff(v.price, v.mrp);
          return (
            <li key={v.id} className="flex items-center gap-3 rounded-lg bg-bg p-3">
              <div className="relative w-14 shrink-0 rounded-md border border-border"><ProductArt icon={p.icon} size="sm" dim={v.stock <= 0} /></div>
              <div className="min-w-0 flex-1">
                {off > 0 && <span className="mb-1 inline-block rounded-xs bg-deal px-1.5 py-0.5 text-[9px] font-extrabold text-on-deal">{off}% OFF</span>}
                <p className="text-[13px] font-semibold">{v.unit}</p>
                <p className="text-[13px]"><span className="font-semibold">{inr(v.price)}</span>{off > 0 && <s className="ml-1.5 text-xs text-faint">{inr(v.mrp)}</s>}</p>
              </div>
              <Stepper p={p} v={v} />
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}
