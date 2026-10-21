"use client";
import { useState } from "react";
import { Timer } from "lucide-react";
import type { CardProduct } from "@/lib/dto";
import { inr, pctOff } from "@/lib/money";
import { Stepper } from "./AddToCart";
import { useQty } from "../cart/store";

function Chip({ p, v, selected, onSelect }: { p: CardProduct; v: CardProduct["variants"][number]; selected: boolean; onSelect: () => void }) {
  const qty = useQty(v.id);
  const off = pctOff(v.price, v.mrp);
  return (
    <button
      role="radio" aria-checked={selected} onClick={onSelect}
      aria-label={`${v.unit}, ${inr(v.price)}${off ? `, ${off}% off` : ""}${v.stock <= 0 ? ", sold out" : ""}`}
      className={`relative min-w-[104px] rounded-md border-2 px-3 pb-2 pt-5 text-left transition-colors ${selected ? "border-accent bg-accent-soft" : "border-border bg-bg hover:border-input"} ${v.stock <= 0 ? "opacity-60" : ""}`}
    >
      {off > 0 && <span className="absolute inset-x-0 top-0 rounded-t-[10px] bg-deal py-0.5 text-center text-2xs font-extrabold text-on-deal">{off}% OFF</span>}
      {qty > 0 && <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-accent text-2xs font-extrabold text-on-accent">{qty}</span>}
      <span className="block text-sm font-bold">{v.unit}</span>
      <span className="block text-sm"><b>{inr(v.price)}</b>{off > 0 && <s className="ml-1 text-xs text-faint">{inr(v.mrp)}</s>}</span>
      {v.stock <= 0 && <span className="block text-2xs font-bold text-danger">Sold out</span>}
    </button>
  );
}

export function BuyBox({ p, eta }: { p: CardProduct; eta: number | null }) {
  const firstInStock = Math.max(0, p.variants.findIndex((v) => v.stock > 0));
  const [i, setI] = useState(firstInStock);
  const v = p.variants[i];
  const off = pctOff(v.price, v.mrp);
  const lowStock = v.stock > 0 && v.stock <= 5;
  return (
    <>
      {eta && <span className="inline-flex items-center gap-1 rounded-xs bg-surface px-1.5 py-0.5 text-2xs font-extrabold uppercase"><Timer size={11} strokeWidth={3} /> {eta} mins</span>}
      <h1 className="mt-2 text-xl font-extrabold leading-tight md:text-2xl">{p.name}</h1>
      <p className="mt-1 text-sm text-muted">{p.brand}</p>

      {p.variants.length > 1 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-extrabold">Pick a size</p>
          <div role="radiogroup" aria-label="Size" className="flex flex-wrap gap-3">
            {p.variants.map((x, j) => <Chip key={x.id} p={p} v={x} selected={j === i} onSelect={() => setI(j)} />)}
          </div>
        </div>
      )}

      <div className="mt-5 hidden items-center justify-between rounded-md border border-border p-4 md:flex">
        <PriceBlock unit={v.unit} price={v.price} mrp={v.mrp} off={off} />
        <Stepper p={p} v={v} size="lg" />
      </div>
      {lowStock && <p className="mt-2 text-xs font-bold text-warning">Only {v.stock} left at your store</p>}

      {/* mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-bg px-4 py-3 shadow-bar md:hidden">
        <PriceBlock unit={v.unit} price={v.price} mrp={v.mrp} off={off} />
        <Stepper p={p} v={v} size="lg" />
      </div>
    </>
  );
}

function PriceBlock({ unit, price, mrp, off }: { unit: string; price: number; mrp: number; off: number }) {
  return (
    <div className="leading-tight">
      <p className="text-xs text-muted">{unit}</p>
      <p className="mt-0.5 flex items-center gap-1.5">
        <span className="text-lg font-extrabold">{inr(price)}</span>
        {off > 0 && <><s className="text-sm text-faint">MRP {inr(mrp)}</s><span className="rounded-xs bg-info-soft px-1 text-2xs font-extrabold text-info">{off}% OFF</span></>}
      </p>
      <p className="text-2xs text-muted">Price includes all taxes</p>
    </div>
  );
}
