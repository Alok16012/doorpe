"use client";
import { useState } from "react";
import type { CardProduct } from "@/lib/dto";
import { inr, pctOff } from "@/lib/money";
import { Stepper } from "./AddToCart";
import { Timer9 } from "./ProductCard";
import { useQty } from "../cart/store";

function Chip({ p, v, selected, onSelect }: { p: CardProduct; v: CardProduct["variants"][number]; selected: boolean; onSelect: () => void }) {
  const qty = useQty(v.id);
  const off = pctOff(v.price, v.mrp);
  return (
    <button
      role="radio" aria-checked={selected} onClick={onSelect}
      aria-label={`${v.unit}, ${inr(v.price)}${off ? `, ${off}% off` : ""}${v.stock <= 0 ? ", sold out" : ""}`}
      className={`relative min-w-[96px] rounded-lg border px-3 pb-2 pt-6 text-left transition-colors ${selected ? "border-accent ring-1 ring-accent" : "border-border bg-bg hover:border-input"} ${v.stock <= 0 ? "opacity-60" : ""}`}
    >
      {off > 0 && <span className="absolute inset-x-0 top-0 rounded-t-[11px] bg-gradient-to-r from-deal to-[#4f86f0] py-[3px] text-center text-[9px] font-extrabold text-on-deal">{off}% OFF</span>}
      {qty > 0 && <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-on-accent">{qty}</span>}
      <span className="block text-[13px] font-semibold">{v.unit}</span>
      <span className="mt-0.5 block text-[13px]"><b className="font-bold">{inr(v.price)}</b>{off > 0 && <s className="ml-1 text-[11px] text-faint">MRP {inr(v.mrp)}</s>}</span>
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
      {eta && <Timer9 eta={eta} />}
      <h1 className="mt-2 text-[20px] font-bold leading-tight text-text md:text-2xl">{p.name}</h1>

      {p.variants.length > 1 && (
        <div className="mt-5">
          <p className="mb-2.5 text-sm font-semibold">Select Unit</p>
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
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 rounded-t-xl bg-bg px-4 py-3 shadow-bar md:hidden">
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
        <span className="text-base font-bold">{inr(price)}</span>
        {off > 0 && <><s className="text-xs text-faint">MRP {inr(mrp)}</s><span className="rounded-xs bg-deal px-1 py-0.5 text-[9px] font-extrabold text-on-deal">{off}% OFF</span></>}
      </p>
      <p className="mt-0.5 text-[10px] text-muted">Inclusive of all taxes</p>
    </div>
  );
}
