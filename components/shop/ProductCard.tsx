import Link from "next/link";
import type { CardProduct } from "@/lib/dto";
import { inr, pctOff } from "@/lib/money";
import { OffBadge, ProductArt } from "./ProductArt";
import { AddToCart, UnitPicker } from "./AddToCart";

export function Timer9({ eta }: { eta: number }) {
  return (
    <span className="inline-flex w-fit items-center gap-[3px] rounded-xs bg-search px-1.5 py-[3px] text-[9px] font-bold uppercase leading-none text-text">
      <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden><circle cx="6" cy="6.8" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 4.4v2.6M4.6 1h2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      {eta} mins
    </span>
  );
}

export function ProductCard({ p, eta, variant = "grid", sponsored = false }: { p: CardProduct; eta: number | null; variant?: "grid" | "rail"; sponsored?: boolean }) {
  const v = p.variants[0];
  const off = pctOff(v.price, v.mrp);
  const soldOut = p.variants.every((x) => x.stock <= 0);
  const rail = variant === "rail";
  return (
    <article className={`relative flex h-full flex-col bg-bg ${rail ? "w-[126px] shrink-0 md:w-[180px]" : "w-full rounded-lg border border-border"}`}>
      <Link href={`/p/${p.slug}`} className={`relative block ${rail ? "rounded-lg border border-border" : "px-2 pt-2"}`} tabIndex={-1} aria-hidden>
        {off > 0 && !soldOut && <OffBadge pct={off} className={rail ? "left-2 top-0" : "left-3 top-0"} />}
        <ProductArt icon={p.icon} dim={soldOut} />
        {soldOut && <span className="absolute inset-x-2 bottom-2 rounded-xs bg-text/75 py-1 text-center text-[10px] font-bold uppercase text-bg">Out of stock</span>}
      </Link>
      {sponsored && <span className="absolute right-2 top-2 rounded-xs bg-search px-1 text-[9px] font-semibold text-muted">Ad</span>}
      <div className={`flex flex-1 flex-col ${rail ? "pt-2" : "px-3 pb-3 pt-1.5"}`}>
        {eta ? <Timer9 eta={eta} /> : <span className="h-4" />}
        <h3 className="mt-1.5 line-clamp-2 min-h-[30px] text-[13px] font-semibold leading-[15px] text-text">
          <Link href={`/p/${p.slug}`}>{p.name}</Link>
        </h3>
        {rail && p.variants.length > 1 && !soldOut
          ? <div className="mt-1.5"><UnitPicker p={p} /></div>
          : <p className="mt-1.5 truncate text-xs font-medium text-[#4f4f4f]">{v.unit}</p>}
        <div className="mt-auto flex items-center justify-between gap-1 pt-3">
          <p className="leading-none">
            <span className="block text-[13px] font-semibold text-text">{inr(v.price)}</span>
            {off > 0 && <s className="mt-0.5 block text-xs font-medium text-faint">{inr(v.mrp)}</s>}
          </p>
          {!soldOut && <AddToCart p={p} />}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-bg p-2">
      <div className="skeleton aspect-square w-full rounded-md" />
      <div className="skeleton mt-3 h-3 w-4/5 rounded-xs" />
      <div className="skeleton mt-2 h-3 w-2/5 rounded-xs" />
      <div className="mt-4 flex justify-between"><div className="skeleton h-4 w-10 rounded-xs" /><div className="skeleton h-8 w-16 rounded-sm" /></div>
    </div>
  );
}
